const { BidAuctionOnchain, AuctionOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createBidAuctionOnchain = async (bidAuctionOnchainBody) => {
  const { contractAddress, tokenId, creator, isErc721, ...newBidAuctionOnchainBody } = bidAuctionOnchainBody;
  const query = { contractAddress, tokenId };
  if (!isErc721) query.creator = creator;
  const auctionOnchain = await AuctionOnchain.findOne(query).sort({ createdAt: -1 });
  if (!auctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AuctionOnchain not found');
  }
  const bidAuctionOnchains = await BidAuctionOnchain.find({ auctionOnchain: auctionOnchain._id });
  if (bidAuctionOnchains.length > 0) {
    const bidAuctionOnchain = bidAuctionOnchains[bidAuctionOnchains.length - 1];
    bidAuctionOnchain.isClaimed = true;
    await bidAuctionOnchain.save();
  }
  Object.assign(newBidAuctionOnchainBody, {
    auctionOnchain: auctionOnchain._id,
    bidAuctionId: bidAuctionOnchains.length,
  });
  return BidAuctionOnchain.create(newBidAuctionOnchainBody);
};

const queryBidAuctionOnchains = async (bidAuctionOnchainQuery) => {
  const filter = pick(bidAuctionOnchainQuery, []);
  const options = pick(bidAuctionOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const bidAuctionOnchains = await BidAuctionOnchain.paginate(filter, options);
  return bidAuctionOnchains;
};

const getBidAuctionOnchainById = async (id) => {
  return BidAuctionOnchain.findById(id);
};

const updateBidAuctionOnchainById = async (bidAuctionOnchainId, updateBody) => {
  const bidAuctionOnchain = await getBidAuctionOnchainById(bidAuctionOnchainId);
  if (!bidAuctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BidAuctionOnchain not found');
  }
  Object.assign(bidAuctionOnchain, updateBody);
  await bidAuctionOnchain.save();
  return bidAuctionOnchain;
};

const deleteBidAuctionOnchainById = async (bidAuctionOnchainId) => {
  const bidAuctionOnchain = await getBidAuctionOnchainById(bidAuctionOnchainId);
  if (!bidAuctionOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BidAuctionOnchain not found');
  }
  await bidAuctionOnchain.deleteOne();
  return bidAuctionOnchain;
};

module.exports = {
  createBidAuctionOnchain,
  queryBidAuctionOnchains,
  getBidAuctionOnchainById,
  updateBidAuctionOnchainById,
  deleteBidAuctionOnchainById,
};
