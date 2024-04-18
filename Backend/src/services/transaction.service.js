const { Transaction } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createTransaction = async (transactionBody) => {
  return Transaction.create(transactionBody);
};

const queryTransactions = async (transactionQuery) => {
  const filter = pick(transactionQuery, []);
  const options = pick(transactionQuery, ['sortBy', 'limit', 'page', 'populate']);
  const transactions = await Transaction.paginate(filter, options);
  return transactions;
};

const getTransactionById = async (id) => {
  return Transaction.findById(id);
};

const updateTransactionById = async (transactionId, updateBody) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};

const deleteTransactionById = async (transactionId) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  await transaction.deleteOne();
  return transaction;
};

module.exports = {
  createTransaction,
  queryTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
};
