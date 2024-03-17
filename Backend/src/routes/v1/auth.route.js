const express = require('express');
const { auth } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authValidation } = require('../../validations');
const { authController } = require('../../controllers');

const authRouter = express.Router();

authRouter.route('/register').post(validate(authValidation.register), authController.register);
authRouter.route('/login').post(validate(authValidation.login), authController.login);
authRouter.route('/logout').post(validate(authValidation.logout), authController.logout);
authRouter.route('/refresh-tokens').post(validate(authValidation.refreshTokens), authController.refreshTokens);
authRouter.route('/forgot-password').post(validate(authValidation.forgotPassword), authController.forgotPassword);
authRouter.route('/reset-password').post(validate(authValidation.resetPassword), authController.resetPassword);
authRouter.route('/send-verification-email').post(auth, authController.sendVerificationEmail);
authRouter.route('/verify-email').get(validate(authValidation.verifyEmail), authController.verifyEmail);
authRouter.route('/token').post(validate(authValidation.getUserByToken), authController.getUserByToken);

module.exports = authRouter;
