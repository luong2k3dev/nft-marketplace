const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const makeOfferOnchainSchema = mongoose.Schema(
  {
    orderOnchain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderOnchain',
      required: true,
    },
    offerId: {
      type: BigInt,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    offerAmount: {
      type: BigInt,
      required: true,
    },
    offerPrice: {
      type: BigInt,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'cancelled', 'accepted', 'rejected'],
      default: 'pending',
    },
    isClaimed: {
      type: Boolean,
      default: false,
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

makeOfferOnchainSchema.plugin(toJSON);

const MakeOfferOnchain = mongoose.model('MakeOfferOnchain', makeOfferOnchainSchema);

module.exports = MakeOfferOnchain;
