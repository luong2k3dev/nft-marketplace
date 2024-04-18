const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const bidAuctionOnchainSchema = mongoose.Schema(
  {
    auctionOnchain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuctionOnchain',
      required: true,
    },
    bidAuctionId: {
      type: Number,
      required: true,
    },
    bidder: {
      type: String,
      required: true,
    },
    bidPrice: {
      type: String,
      required: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    isWinner: {
      type: Boolean,
      default: false,
    },
    blockTimeStamp: {
      type: BigInt,
    },
  },
  {
    timestamps: true,
  },
);

bidAuctionOnchainSchema.plugin(toJSON);

const BidAuctionOnchain = mongoose.model('BidAuctionOnchain', bidAuctionOnchainSchema);

module.exports = BidAuctionOnchain;
