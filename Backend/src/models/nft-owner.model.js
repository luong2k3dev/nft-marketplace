const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const nftOwnerSchema = mongoose.Schema(
  {
    nftOnchain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NftOnchain',
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    amount: {
      type: BigInt,
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

nftOwnerSchema.plugin(toJSON);

const NftOwner = mongoose.model('NftOwner', nftOwnerSchema);

module.exports = NftOwner;
