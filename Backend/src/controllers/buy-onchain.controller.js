const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { buyOnchainService } = require('../services');

const getBuyOnchains = catchAsync(async (req, res) => {
  const result = await buyOnchainService.queryBuyOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getBuyOnchain = catchAsync(async (req, res) => {
  const data = await buyOnchainService.getBuyOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Buy onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getBuyOnchains,
  getBuyOnchain,
};
