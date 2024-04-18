const { BuyOnchain, NftOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createBuyOnchain = async (buyOnchainBody) => {
  const { contractAddress, tokenId, ...newBuyOnchainBody } = buyOnchainBody;
  const nftOnchain = await NftOnchain.findOne({ contractAddress, tokenId });
  if (!nftOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOnchain not found');
  }
  Object.assign(newBuyOnchainBody, { nftOnchain: nftOnchain._id });
  return BuyOnchain.create(newBuyOnchainBody);
};

const queryBuyOnchains = async (buyOnchainQuery) => {
  const filter = pick(buyOnchainQuery, []);
  const options = pick(buyOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const buyOnchains = await BuyOnchain.paginate(filter, options);
  return buyOnchains;
};

const getBuyOnchainById = async (id) => {
  return BuyOnchain.findById(id);
};

const updateBuyOnchainById = async (buyOnchainId, updateBody) => {
  const buyOnchain = await getBuyOnchainById(buyOnchainId);
  if (!buyOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BuyOnchain not found');
  }
  Object.assign(buyOnchain, updateBody);
  await buyOnchain.save();
  return buyOnchain;
};

const deleteBuyOnchainById = async (buyOnchainId) => {
  const buyOnchain = await getBuyOnchainById(buyOnchainId);
  if (!buyOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BuyOnchain not found');
  }
  await buyOnchain.deleteOne();
  return buyOnchain;
};

module.exports = {
  createBuyOnchain,
  queryBuyOnchains,
  getBuyOnchainById,
  updateBuyOnchainById,
  deleteBuyOnchainById,
};
