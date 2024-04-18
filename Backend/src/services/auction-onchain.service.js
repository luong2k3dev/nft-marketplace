const { AuctionOnchain, BidAuctionOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createAuctionOnchain = async (auctionOnchainBody) => {
  const { contractAddress, tokenId, creator, isErc721 } = auctionOnchainBody;
  const query = { contractAddress, tokenId };
  if (!isErc721) query.creator = creator;
  const auctionOnchains = await AuctionOnchain.find(query);
  auctionOnchainBody.auctionId = auctionOnchains.length;
  return AuctionOnchain.create(auctionOnchainBody);
};

const queryAuctionOnchains = async (auctionOnchainQuery) => {
  const filter = pick(auctionOnchainQuery, []);
  const options = pick(auctionOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const auctionOnchains = await AuctionOnchain.paginate(filter, options);
  return auctionOnchains;
};

const getAuctionOnchainById = async (id) => {
  return AuctionOnchain.findById(id);
};

const updateAuctionOnchainById = async (auctionOnchainId, updateBody) => {
  const auctionOnchain = await getAuctionOnchainById(auctionOnchainId);
  if (!auctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AuctionOnchain not found');
  }
  Object.assign(auctionOnchain, updateBody);
  await auctionOnchain.save();
  return auctionOnchain;
};

const endAuctionOnchain = async (contractAddress, tokenId, creator, isErc721, status) => {
  const query = { contractAddress, tokenId };
  if (!isErc721) query.creator = creator;
  const auctionOnchain = await AuctionOnchain.findOne(query).sort({ createdAt: -1 });
  if (!auctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AuctionOnchain not found');
  }
  if (status === 'cancelled') {
    auctionOnchain.status = 'cancelled';
    await auctionOnchain.save();
    return;
  }
  const bidAuctionOnchain = await BidAuctionOnchain.findOne({ auctionOnchain: auctionOnchain._id }).sort({
    createdAt: -1,
  });
  if (!bidAuctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BidAuctionOnchain not found');
  }
  if (status === 'ended') {
    auctionOnchain.status = 'ended';
    await auctionOnchain.save();
    bidAuctionOnchain.isWinner = true;
    await bidAuctionOnchain.save();
  } else if (status === 'claimed') {
    const bidAuctionOnchain = await BidAuctionOnchain.findOne({ auctionOnchain: auctionOnchain._id }).sort({
      createdAt: -1,
    });
    bidAuctionOnchain.isClaimed = true;
    bidAuctionOnchain.isWinner = true;
    await bidAuctionOnchain.save();
  }
};

const deleteAuctionOnchainById = async (auctionOnchainId) => {
  const auctionOnchain = await getAuctionOnchainById(auctionOnchainId);
  if (!auctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AuctionOnchain not found');
  }
  await auctionOnchain.deleteOne();
  return auctionOnchain;
};

module.exports = {
  createAuctionOnchain,
  queryAuctionOnchains,
  getAuctionOnchainById,
  updateAuctionOnchainById,
  endAuctionOnchain,
  deleteAuctionOnchainById,
};
