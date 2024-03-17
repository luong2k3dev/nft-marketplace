const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { roleService } = require('../services');

const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, 'Role created successfully', role));
});

const getRoles = catchAsync(async (req, res) => {
  const result = await roleService.queryRoles(req.query);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', result));
});

const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', role));
});

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRoleById(req.params.roleId, req.body);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', role));
});

const deleteRole = catchAsync(async (req, res) => {
  const role = await roleService.deleteRoleById(req.params.roleId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', role));
});

const lockRole = catchAsync(async (req, res) => {
  const role = await roleService.lockRoleById(req.params.roleId);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', role));
});

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
  lockRole,
};
