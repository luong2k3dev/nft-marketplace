const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { makeofferOnchainService } = require('../services');

const getMakeOfferOnchains = catchAsync(async (req, res) => {
  const result = await makeofferOnchainService.queryMakeOfferOnchains(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getMakeOfferOnchain = catchAsync(async (req, res) => {
  const data = await makeofferOnchainService.getMakeOfferOnchainById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'MakeOffer onchain not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getMakeOfferOnchains,
  getMakeOfferOnchain,
};
