const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  let _user = user;
  _user.id = user._id;
  const tokens = await tokenService.generateAuthTokens(_user);
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(_user);
  await emailService.sendVerificationEmail(_user.email, verifyEmailToken, _user.username);
  res.status(httpStatus.CREATED).json(response(httpStatus.CREATED, 'Register successfully', { user, tokens }));
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Login successfully', { user, tokens }));
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Logout successfully'));
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshToken(req.body.refreshToken);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Successfully', { tokens }));
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  const user = await userService.getUserByEmail(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken, user?.username | '');
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Please check your email to confirm the password change'));
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Reset password successfully'));
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.username);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Please check your email to verify your account'));
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.OK).json(response(httpStatus.OK, 'Email verification successfully'));
});

const getUserByToken = catchAsync(async (req, res) => {
  const user = await authService.getUserByToken(req.body.token);
  res.status(httpStatus.OK).json({ user });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  getUserByToken,
};
