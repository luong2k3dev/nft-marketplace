const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { transactionService } = require('../services');

const getTransactions = catchAsync(async (req, res) => {
  const result = await transactionService.queryTransactions(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getTransaction = catchAsync(async (req, res) => {
  const data = await transactionService.getTransactionById(req.params.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', data));
});

module.exports = {
  getTransactions,
  getTransaction,
};
