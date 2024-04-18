const { MakeOfferOnchain, OrderOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createMakeOfferOnchain = async (makeOfferOnchainBody) => {
  const { contractAddress, tokenId, seller, isErc721, ...newMakeOfferOnchainBody } = makeOfferOnchainBody;
  const query = { contractAddress, tokenId };
  if (!isErc721) query.seller = seller;
  const orderOnchain = await OrderOnchain.findOne(query).sort({ createdAt: -1 });
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  const makeOfferOnchains = await MakeOfferOnchain.find({ orderOnchain: orderOnchain._id });
  Object.assign(newMakeOfferOnchainBody, { orderOnchain: orderOnchain._id, offerId: makeOfferOnchains.length });
  return MakeOfferOnchain.create(newMakeOfferOnchainBody);
};

const queryMakeOfferOnchains = async (makeOfferOnchainQuery) => {
  const filter = pick(makeOfferOnchainQuery, []);
  const options = pick(makeOfferOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const makeOfferOnchains = await MakeOfferOnchain.paginate(filter, options);
  return makeOfferOnchains;
};

const getMakeOfferOnchainById = async (id) => {
  return MakeOfferOnchain.findById(id);
};

const updateMakeOfferOnchainById = async (makeOfferOnchainId, updateBody) => {
  const makeOfferOnchain = await getMakeOfferOnchainById(makeOfferOnchainId);
  if (!makeOfferOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MakeOfferOnchain not found');
  }
  Object.assign(makeOfferOnchain, updateBody);
  await makeOfferOnchain.save();
  return makeOfferOnchain;
};

const acceptOfferOnchain = async (contractAddress, tokenId, seller, offerId, isErc721) => {
  const query = { contractAddress, tokenId };
  if (!isErc721) query.seller = seller;
  const orderOnchain = await OrderOnchain.findOne(query).sort({ createdAt: -1 });
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  const makeOfferOnchain = await MakeOfferOnchain.findOne({ orderOnchain: orderOnchain._id, offerId });
  if (!makeOfferOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MakeOfferOnchain not found');
  }
  await MakeOfferOnchain.updateMany(
    { orderOnchain: orderOnchain._id, status: 'pending' },
    { $set: { status: 'rejected', isClaimed: true } },
  );
  makeOfferOnchain.status = 'accepted';
  await makeOfferOnchain.save();
  return makeOfferOnchain;
};

const cancleOfferOnchain = async (contractAddress, tokenId, seller, offerId, isErc721) => {
  const query = { contractAddress, tokenId };
  if (!isErc721) query.seller = seller;
  const orderOnchain = await OrderOnchain.findOne(query).sort({ createdAt: -1 });
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  const makeOfferOnchain = await MakeOfferOnchain.findOne({ orderOnchain: orderOnchain._id, offerId });
  if (!makeOfferOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MakeOfferOnchain not found');
  }
  makeOfferOnchain.status = 'cancelled';
  await makeOfferOnchain.save();
  return makeOfferOnchain;
};

const deleteMakeOfferOnchainById = async (makeOfferOnchainId) => {
  const makeOfferOnchain = await getMakeOfferOnchainById(makeOfferOnchainId);
  if (!makeOfferOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MakeOfferOnchain not found');
  }
  await makeOfferOnchain.deleteOne();
  return makeOfferOnchain;
};

module.exports = {
  createMakeOfferOnchain,
  queryMakeOfferOnchains,
  getMakeOfferOnchainById,
  updateMakeOfferOnchainById,
  acceptOfferOnchain,
  cancleOfferOnchain,
  deleteMakeOfferOnchainById,
};
