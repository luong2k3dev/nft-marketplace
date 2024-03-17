const { User, Role } = require('../models');
const config = require('../config/config');
const logger = require('../config/logger');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }
  const role = await Role.findOne({ roleIndex: 'user' });
  const roles = userBody.roles || (role ? [role._id] : []);
  userBody.roles = [...new Set(roles)];
  return User.create(userBody);
};

const queryUsers = async (userQuery) => {
  const filter = pick(userQuery, ['email', 'username']);
  const options = pick(userQuery, ['sortBy', 'limit', 'page', 'populate']);
  if (userQuery.role) {
    const roles = await Role.find({ roleIndex: userQuery.role });
    const roleIds = roles.map((role) => role._id);
    filter['roles'] = { $in: roleIds };
  }
  if (userQuery.createdAt) {
    const dateValue = userQuery.createdAt;
    let dateStart = new Date(dateValue.split('/')[0]);
    let dateEnd = new Date(dateValue.split('/')[1]);
    dateEnd.setDate(dateEnd.getDate() + 1);
    filter['createdAt'] = { $gte: dateStart, $lte: dateEnd };
  }
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id).populate('roles');
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

const lockUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, { isLocked: !user.isLocked });
  await user.save();
  return user;
};

const createAdminAccount = async () => {
  const admin = await User.findOne({ email: config.admin.email });
  if (!admin) {
    const role = await Role.findOne({ roleIndex: 'admin' });
    await User.create({
      email: config.admin.email,
      password: config.admin.password,
      username: config.admin.username,
      roles: [role._id],
      isEmailVerified: true,
    });
  }
  logger.info(`Admin account: ${config.admin.email}`);
  logger.info(`Admin password: ${config.admin.password}`);
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  lockUserById,
  createAdminAccount,
};
