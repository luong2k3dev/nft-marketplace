const config = require('../config/config');
const cron = require('node-cron');
const { Web3 } = require('web3');
const web3 = new Web3(config.onchain.network_rpc_url);
const contractJson = require('../contract.json');
const {
  synchronizeService,
  transactionService,
  nftOwnerService,
  nftOnchainService,
  orderOnchainService,
  buyOnchainService,
  makeofferOnchainService,
  auctionOnchainService,
  bidauctionOnchainService,
} = require('../services');

const contracts = {
  // erc20Token: new web3.eth.Contract(contractJson.erc20Token.abi, contractJson.erc20Token.address),
  erc721Token: new web3.eth.Contract(contractJson.erc721Token.abi, contractJson.erc721Token.address),
  erc1155Token: new web3.eth.Contract(contractJson.erc1155Token.abi, contractJson.erc1155Token.address),
  // tokenSale: new web3.eth.Contract(contractJson.tokenSale.abi, contractJson.tokenSale.address),
  nftMarketplace: new web3.eth.Contract(contractJson.nftMarketplace.abi, contractJson.nftMarketplace.address),
};

const onJobGetDataFromSmartContract = async () => {
  try {
    const currentBlock = await web3.eth.getBlockNumber();
    console.log('Current block onchain:', currentBlock);
    const lastSynchronized = await synchronizeService.getLastSynchronize();
    const lastBlockSynchronized = lastSynchronized ? lastSynchronized.toBlock + 1 : config.onchain.block_number_start;
    const lastBlockOnchain = Math.min(Number(currentBlock), lastBlockSynchronized + 10000);
    await synchronize(lastBlockSynchronized, lastBlockOnchain);
  } catch (err) {
    console.error(err);
  }
};

const synchronize = async (startBlock, endBlock) => {
  console.log(`👂 Listen from block ${startBlock} to ${endBlock}`);

  const getPastEventsConfig = { fromBlock: startBlock, toBlock: endBlock };

  const synchronize = await synchronizeService.createSynchronize(getPastEventsConfig);

  for (const contractName in contracts) {
    const contract = contracts[contractName];
    const listEvents = await contract.getPastEvents('allEvents', getPastEventsConfig);
    const sortedEvents = listEvents.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
    console.log('Transactions ' + contractName + ':', sortedEvents);
    for (const event of sortedEvents) {
      const block = await web3.eth.getBlock(event.blockNumber);
      await transactionService.createTransaction({
        contractAddress: event.address,
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
        blockNumber: event.blockNumber,
        eventName: event.event,
        sender: '',
        receiver: '',
        blockTimeStamp: block.timestamp,
        synchronize: synchronize.id,
      });
      event.blockTimeStamp = block.timestamp;

      switch (contractName) {
        case 'erc721Token':
          await handleSyncErc721Token(event, contract);
          break;
        case 'nftMarketplace':
          await handleSyncMarketplace(event, contract);
          break;
        default:
          break;
      }
    }
  }
};

const handleSyncErc721Token = async (event, contract) => {
  const eventName = event.event;
  const blockTimeStamp = event.blockTimeStamp;
  if (eventName === 'Transfer') {
    const { from, to, tokenId } = event.returnValues;
    if (parseInt(from, 16) === 0) {
      const tokenUri = await contract.methods.tokenURI(tokenId).call();

      const nftOnchain = await nftOnchainService.createNftOnchain({
        contractAddress: event.address,
        tokenId: tokenId,
        amount: 1,
        creator: to,
        metadata: tokenUri,
        isErc721: true,
        blockTimeStamp,
      });

      await nftOwnerService.createNftOwner({
        nftOnchain: nftOnchain._id,
        owner: to,
        amount: 1,
        blockTimeStamp,
      });
    } else {
      await nftOwnerService.updateNftOwner(event.address, tokenId, {
        from,
        to,
        amount: 1,
        isErc721: true,
        blockTimeStamp,
      });
    }
  }
};

const handleSyncMarketplace = async (event, contract) => {
  const eventName = event.event;
  const { isErc721 } = event.returnValues;
  const contractAddress = isErc721 ? contractJson.erc721Token.address : contractJson.erc1155Token.address;
  const blockTimeStamp = event.blockTimeStamp;
  switch (eventName) {
    case 'NFTListedForSale':
      {
        const { seller, tokenId, amount, price } = event.returnValues;
        await orderOnchainService.createOrderOnchain({
          contractAddress,
          seller,
          tokenId,
          amount,
          price,
          isErc721,
          blockTimeStamp,
        });
      }
      break;
    case 'NFTSold':
      {
        const { buyer, seller, tokenId, buyAmount, buyPrice, isSoldOut } = event.returnValues;
        const status = isSoldOut ? 'soldOut' : 'sold';
        await orderOnchainService.endOrderOnchain(contractAddress, tokenId, seller, isErc721, status);
      }
      break;
    case 'NFTOffered':
      {
        const { buyer, tokenId, seller, offerAmount, offerPrice } = event.returnValues;
        await makeofferOnchainService.createMakeOfferOnchain({
          contractAddress,
          tokenId,
          seller,
          isErc721,
          buyer,
          offerAmount,
          offerPrice,
          blockTimeStamp,
        });
      }
      break;
    case 'NFTOfferCanceled':
      {
        const { seller, tokenId, offerId } = event.returnValues;
        await makeofferOnchainService.cancleOfferOnchain(contractAddress, tokenId, seller, offerId, isErc721);
      }
      break;
    case 'NFTOfferAccepted':
      {
        const { seller, tokenId, offerId, isSoldOut } = event.returnValues;
        await makeofferOnchainService.acceptOfferOnchain(contractAddress, tokenId, seller, offerId, isErc721);
        const status = isSoldOut ? 'soldOut' : 'sold';
        await orderOnchainService.endOrderOnchain(contractAddress, tokenId, seller, isErc721, status);
      }
      break;
    case 'NFTListedForAuction':
      {
        const { creator, tokenId, amount, startTime, endTime, startingPrice, step } = event.returnValues;
        await auctionOnchainService.createAuctionOnchain({
          contractAddress,
          tokenId,
          amount,
          creator,
          startTime,
          endTime,
          startingPrice,
          step,
          isErc721,
          blockTimeStamp,
        });
      }
      break;
    case 'NFTAuctionBidPlaced':
      {
        const { creator, tokenId, bidder, bidPrice } = event.returnValues;
        await bidauctionOnchainService.createBidAuctionOnchain({
          contractAddress,
          tokenId,
          creator,
          isErc721,
          bidder,
          bidPrice,
          blockTimeStamp,
        });
      }
      break;
    case 'NFTAuctionEnded':
      {
        const { creator, tokenId } = event.returnValues;
        await auctionOnchainService.endAuctionOnchain(contractAddress, tokenId, creator, isErc721, 'ended');
      }
      break;
    case 'NFTClaimed': {
      const { seller, tokenId, isAuction, isErc721 } = event.returnValues;
      if (!isAuction) {
        await orderOnchainService.endOrderOnchain(contractAddress, tokenId, seller, isErc721, 'claimed');
      } else {
        await auctionOnchainService.endAuctionOnchain(contractAddress, tokenId, seller, isErc721, 'claimed');
      }
    }
    case 'NFTListingCancelled':
      {
        const { seller, tokenId, isAuction } = event.returnValues;
        if (!isAuction) {
          await orderOnchainService.endOrderOnchain(contractAddress, tokenId, seller, isErc721, 'cancelled');
        } else {
          await auctionOnchainService.endAuctionOnchain(contractAddress, tokenId, seller, isErc721, 'cancelled');
        }
      }
      break;
    default:
      break;
  }
};

const startSynchronizeDataFromSmartContract = () => {
  cron.schedule('*/6 * * * * *', onJobGetDataFromSmartContract);
};

module.exports = { startSynchronizeDataFromSmartContract };
