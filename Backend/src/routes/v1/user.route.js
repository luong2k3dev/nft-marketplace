const express = require('express');
const { auth, authorize } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { userValidation } = require('../../validations');
const { userController } = require('../../controllers');

const userRouter = express.Router();

userRouter
  .route('/profile')
  .get(auth, validate(userValidation.getUser), userController.getUser)
  .put(auth, validate(userValidation.updateUser), userController.updateProfile);
userRouter
  .route('/')
  .get(auth, authorize(['admin']), validate(userValidation.getUsers), userController.getUsers)
  .post(auth, authorize(['admin']), validate(userValidation.createUser), userController.createUser);
userRouter
  .route('/:userId')
  .get(auth, validate(userValidation.getUser), userController.getUser)
  .put(auth, authorize(['admin']), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth, authorize(['admin']), validate(userValidation.deleteUser), userController.deleteUser)
  .lock(auth, authorize(['admin']), userController.lockUser);

module.exports = userRouter;
