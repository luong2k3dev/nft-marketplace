const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { nftOwnerService } = require('../services');

const getNftOwners = catchAsync(async (req, res) => {
  const result = await nftOwnerService.queryNftOwners(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getNftOwner = catchAsync(async (req, res) => {
  const data = await nftOwnerService.getNftOwnerById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Nft owner not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getNftOwners,
  getNftOwner,
};
