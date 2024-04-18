const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const buyOnchainSchema = mongoose.Schema(
  {
    nftOnchain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NftOnchain',
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    buyAmount: {
      type: BigInt,
      required: true,
    },
    buyPrice: {
      type: BigInt,
      required: true,
    },
    buyType: {
      type: String,
      enum: ['direct', 'offer', 'bid'],
      required: true,
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

buyOnchainSchema.plugin(toJSON);
buyOnchainSchema.plugin(paginate);

const buyOnchain = mongoose.model('buyOnchain', buyOnchainSchema);

module.exports = buyOnchain;
