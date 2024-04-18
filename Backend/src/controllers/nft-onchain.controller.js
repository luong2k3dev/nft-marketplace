const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { nftOnchainService } = require('../services');

const getNftOnchains = catchAsync(async (req, res) => {
  const result = await nftOnchainService.queryNftOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getNftOnchain = catchAsync(async (req, res) => {
  const data = await nftOnchainService.getNftOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Nft onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getNftOnchains,
  getNftOnchain,
};
