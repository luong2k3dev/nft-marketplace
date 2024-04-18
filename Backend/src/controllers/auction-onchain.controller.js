const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { auctionOnchainService } = require('../services');

const getAuctionOnchains = catchAsync(async (req, res) => {
  const result = await auctionOnchainService.queryAuctionOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getAuctionOnchain = catchAsync(async (req, res) => {
  const data = await auctionOnchainService.getAuctionOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Auction onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getAuctionOnchains,
  getAuctionOnchain,
};
