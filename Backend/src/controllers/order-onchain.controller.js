const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { orderOnchainService } = require('../services');

const getOrderOnchains = catchAsync(async (req, res) => {
  const result = await orderOnchainService.queryOrderOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getOrderOnchain = catchAsync(async (req, res) => {
  const data = await orderOnchainService.getOrderOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getOrderOnchains,
  getOrderOnchain,
};
