const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roleSchema = mongoose.Schema(
  {
    roleName: {
      type: String,
      trim: true,
      required: true,
    },
    roleIndex: {
      type: String,
      trim: true,
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

roleSchema.statics.isRoleTaken = async function (roleId, roleIndex) {
  const role = await this.findOne({
    roleIndex: roleIndex,
    _id: { $ne: roleId },
  });
  return !!role;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
