const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { bidauctionOnchainService } = require('../services');

const getBidAuctionOnchains = catchAsync(async (req, res) => {
  const result = await bidauctionOnchainService.queryBidAuctionOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getBidAuctionOnchain = catchAsync(async (req, res) => {
  const data = await bidauctionOnchainService.getBidAuctionOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BidAuction onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getBidAuctionOnchains,
  getBidAuctionOnchain,
};
