const express = require('express');
const { auth, authorize } = require('../../middlewares/auth');
const { roleController } = require('../../controllers');

const roleRouter = express.Router();

roleRouter
  .route('/')
  .get(roleController.getRoles)
  .post(auth, authorize(['admin']), roleController.createRole);

roleRouter
  .route('/:roleId')
  .get(roleController.getRole)
  .put(auth, authorize(['admin']), roleController.updateRole)
  .delete(auth, authorize(['admin']), roleController.deleteRole)
  .lock(auth, authorize(['admin']), roleController.lockRole);

module.exports = roleRouter;
