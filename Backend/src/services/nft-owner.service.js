const { NftOwner, NftOnchain } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createNftOwner = async (nftOwnerBody) => {
  return NftOwner.create(nftOwnerBody);
};

const queryNftOwners = async (nftOwnerQuery) => {
  const filter = pick(nftOwnerQuery, []);
  const options = pick(nftOwnerQuery, ['sortBy', 'limit', 'page', 'populate']);
  const nftOwners = await NftOwner.paginate(filter, options);
  return nftOwners;
};

const getNftOwnerById = async (id) => {
  return NftOwner.findById(id);
};

const updateNftOwnerById = async (nftOwnerId, updateBody) => {
  const nftOwner = await getNftOwnerById(nftOwnerId);
  if (!nftOwner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOwner not found');
  }
  Object.assign(nftOwner, updateBody);
  await nftOwner.save();
  return nftOwner;
};

const updateNftOwner = async (contractAddress, tokenId, updateBody) => {
  const nftOnchain = await NftOnchain.findOne({ contractAddress, tokenId });
  if (!nftOnchain) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOnchain not found');
  }
  const { from, to, amount, isErc721, blockTimeStamp } = updateBody;
  if (isErc721) {
    const nftOwner = await NftOwner.findOne({ nftOnchain: nftOnchain._id });
    if (!nftOwner) {
      throw new ApiError(httpStatus.NOT_FOUND, 'NftOwner not found');
    }
    Object.assign(nftOwner, { owner: to, blockTimeStamp });
    await nftOwner.save();
  } else {
    const nftOwner = await NftOwner.findOne({ nftOnchain: nftOnchain._id, owner: from });
    if (!nftOwner) {
      throw new ApiError(httpStatus.NOT_FOUND, 'NftOwner not found');
    }
    if (nftOwner.amount === amount) {
      Object.assign(nftOwner, { owner: to, blockTimeStamp });
      await nftOwner.save();
    } else {
      nftOwner.amount -= amount;
      await nftOwner.save();
      await NftOwner.create({ nftOnchain: nftOnchain._id, owner: to, amount, blockTimeStamp });
    }
  }
};

const deleteNftOwnerById = async (nftOwnerId) => {
  const nftOwner = await getNftOwnerById(nftOwnerId);
  if (!nftOwner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'NftOwner not found');
  }
  await nftOwner.deleteOne();
  return nftOwner;
};

module.exports = {
  createNftOwner,
  queryNftOwners,
  getNftOwnerById,
  updateNftOwnerById,
  updateNftOwner,
  deleteNftOwnerById,
};
