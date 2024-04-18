const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
nftOwnerSchema.plugin(paginate);

const NftOwner = mongoose.model('NftOwner', nftOwnerSchema);

module.exports = NftOwner;
