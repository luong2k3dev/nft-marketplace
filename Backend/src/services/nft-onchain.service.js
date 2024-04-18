const { NftOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createNftOnchain = async (nftOnchainBody) => {
  return NftOnchain.create(nftOnchainBody);
};

const queryNftOnchains = async (nftOnchainQuery) => {
  const filter = pick(nftOnchainQuery, []);
  const options = pick(nftOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const nftOnchains = await NftOnchain.paginate(filter, options);
  return nftOnchains;
};

const getNftOnchainById = async (id) => {
  return NftOnchain.findById(id);
};

const updateNftOnchainById = async (nftOnchainId, updateBody) => {
  const nftOnchain = await getNftOnchainById(nftOnchainId);
  if (!nftOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOnchain not found');
  }
  Object.assign(nftOnchain, updateBody);
  await nftOnchain.save();
  return nftOnchain;
};

const deleteNftOnchainById = async (nftOnchainId) => {
  const nftOnchain = await getNftOnchainById(nftOnchainId);
  if (!nftOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOnchain not found');
  }
  await nftOnchain.deleteOne();
  return nftOnchain;
};

module.exports = {
  createNftOnchain,
  queryNftOnchains,
  getNftOnchainById,
  updateNftOnchainById,
  deleteNftOnchainById,
};
