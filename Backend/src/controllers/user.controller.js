const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, 'User created Successfully', user));
});

const getUsers = catchAsync(async (req, res) => {
  const result = await userService.queryUsers(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId || req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', user));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', user));
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', user));
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', user));
});

const lockUser = catchAsync(async (req, res) => {
  const user = await userService.lockUserById(req.params.userId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', user));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  lockUser,
};
