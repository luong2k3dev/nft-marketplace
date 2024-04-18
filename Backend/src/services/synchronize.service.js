const { Synchronize } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createSynchronize = async (synchronizeBody) => {
  return Synchronize.create(synchronizeBody);
};

const querySynchronizes = async (synchronizeQuery) => {
  const filter = pick(synchronizeQuery, []);
  const options = pick(synchronizeQuery, ['sortBy', 'limit', 'page', 'populate']);
  const synchronizes = await Synchronize.paginate(filter, options);
  return synchronizes;
};

const getSynchronizeById = async (id) => {
  return Synchronize.findById(id);
};

const getLastSynchronize = async (id) => {
  return Synchronize.findOne().sort({ createdAt: -1 });
};

const updateSynchronizeById = async (synchronizeId, updateBody) => {
  const synchronize = await getSynchronizeById(synchronizeId);
  if (!synchronize) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Synchronize not found');
  }
  Object.assign(synchronize, updateBody);
  await synchronize.save();
  return synchronize;
};

const deleteSynchronizeById = async (synchronizeId) => {
  const synchronize = await getSynchronizeById(synchronizeId);
  if (!synchronize) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Synchronize not found');
  }
  await synchronize.deleteOne();
  return synchronize;
};

module.exports = {
  createSynchronize,
  querySynchronizes,
  getSynchronizeById,
  getLastSynchronize,
  updateSynchronizeById,
  deleteSynchronizeById,
};
