const { Role } = require('../models');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createRole = async (roleBody) => {
  if (await Role.isRoleTaken(null, roleBody.roleIndex)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role already exists');
  }
  return Role.create(roleBody);
};

const queryRoles = async (roleQuery) => {
  const filter = pick(roleQuery, ['roleName', 'roleIndex']);
  const options = pick(roleQuery, ['sortBy', 'limit', 'page', 'populate']);
  const roles = await Role.paginate(filter, options);
  return roles;
};

const getRoleById = async (id) => {
  return Role.findById(id);
};

const updateRoleById = async (roleId, updateBody) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  if (await Role.isRoleTaken(role.id, updateBody.roleIndex)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role already exists');
  }
  Object.assign(role, updateBody);
  await role.save();
  return role;
};

const deleteRoleById = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  await role.deleteOne();
  return role;
};

const lockRoleById = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  Object.assign(role, { isLocked: !role.isLocked });
  await role.save();
  return role;
};

module.exports = {
  createRole,
  queryRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  lockRoleById,
};
