const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const orderOnchainSchema = mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
    },
    tokenId: {
      type: BigInt,
      required: true,
    },
    amount: {
      type: BigInt,
      required: true,
    },
    listingId: {
      type: Number,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    price: {
      type: BigInt,
      required: true,
    },
    isErc721: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      default: 'listed',
      enum: ['listed', 'sold', 'soldOut', 'cancelled'],
    },
    blockTimeStamp: {
      type: BigInt,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

orderOnchainSchema.plugin(toJSON);

const OrderOnchain = mongoose.model('OrderOnchain', orderOnchainSchema);

module.exports = OrderOnchain;
