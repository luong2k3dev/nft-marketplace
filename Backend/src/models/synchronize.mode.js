const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const synchronizeSchema = mongoose.Schema(
  {
    fromBlock: {
      type: Number,
      required: true,
    },
    toBlock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

synchronizeSchema.plugin(toJSON);

const Synchronize = mongoose.model('Synchronize', synchronizeSchema);

module.exports = Synchronize;
