const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const nftOnchainSchema = mongoose.Schema(
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
    creator: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      // required: true,
    },
    image: {
      type: String,
      // required: true,
    },
    metadata: {
      type: String,
      required: true,
    },
    isErc721: {
      type: Boolean,
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

nftOnchainSchema.plugin(toJSON);
nftOnchainSchema.plugin(paginate);

const NftOnchain = mongoose.model('NftOnchain', nftOnchainSchema);

module.exports = NftOnchain;
