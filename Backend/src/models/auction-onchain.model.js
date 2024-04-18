const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const auctionOnchainSchema = mongoose.Schema(
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
    auctionId: {
      type: Number,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    startTime: {
      type: BigInt,
      required: true,
    },
    endTime: {
      type: BigInt,
      required: true,
    },
    startingPrice: {
      type: BigInt, //  47502173
      required: true,
    },
    step: {
      type: BigInt,
      required: true,
    },
    status: {
      type: String,
      default: 'created',
      enum: ['created', 'ended', 'cancelled'],
    },
    blockTimeStamp: {
      type: BigInt,
    },
  },
  {
    timestamps: true,
  },
);

auctionOnchainSchema.plugin(toJSON);
auctionOnchainSchema.plugin(paginate);

const AuctionOnchain = mongoose.model('AuctionOnchain', auctionOnchainSchema);

module.exports = AuctionOnchain;
