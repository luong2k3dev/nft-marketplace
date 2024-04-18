const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const transactionSchema = mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    blockHash: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: BigInt,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      // required: true,
    },
    receiver: {
      type: String,
      // required: true,
    },
    blockTimeStamp: {
      type: BigInt,
      required: true,
    },
    synchronize: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Synchronize',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
