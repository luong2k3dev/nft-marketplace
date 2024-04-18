const { OrderOnchain, BidAuctionOnchain, MakeOfferOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createOrderOnchain = async (orderOnchainBody) => {
  const { contractAddress, tokenId, seller, isErc721 } = orderOnchainBody;
  const query = { contractAddress, tokenId };
  if (!isErc721) query.seller = seller;
  const orderOnchains = await OrderOnchain.find(query);
  orderOnchainBody.listingId = orderOnchains.length;
  return OrderOnchain.create(orderOnchainBody);
};

const queryOrderOnchains = async (orderOnchainQuery) => {
  const filter = pick(orderOnchainQuery, []);
  const options = pick(orderOnchainQuery, ['sortBy', 'limit', 'page', 'populate']);
  const orderOnchains = await OrderOnchain.paginate(filter, options);
  return orderOnchains;
};

const getOrderOnchainById = async (id) => {
  return OrderOnchain.findById(id);
};

const updateOrderOnchainById = async (orderOnchainId, updateBody) => {
  const orderOnchain = await getOrderOnchainById(orderOnchainId);
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  Object.assign(orderOnchain, updateBody);
  await orderOnchain.save();
  return orderOnchain;
};

const endOrderOnchain = async (contractAddress, tokenId, seller, isErc721, status) => {
  const query = { contractAddress, tokenId, status: 'listed' };
  if (!isErc721) query.seller = seller;
  const orderOnchain = await OrderOnchain.findOne(query);
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  if (status === 'claimed') {
    const makeofferOnchain = MakeOfferOnchain.findOne({ orderOnchain: orderOnchain._id, status: 'accepted' });
    if (!makeofferOnchain) {
      throw new ApiError(httpStatus.NOT_FOUND, 'MakeofferOnchain not found');
    }
    makeofferOnchain.isClaimed = true;
    await makeofferOnchain.save();
  } else {
    orderOnchain.status = status;
    await orderOnchain.save();
  }
};

const deleteOrderOnchainById = async (orderOnchainId) => {
  const orderOnchain = await getOrderOnchainById(orderOnchainId);
  if (!orderOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderOnchain not found');
  }
  await orderOnchain.deleteOne();
  return orderOnchain;
};

module.exports = {
  createOrderOnchain,
  queryOrderOnchains,
  getOrderOnchainById,
  updateOrderOnchainById,
  endOrderOnchain,
  deleteOrderOnchainById,
};
