const express = require('express');
const router = express.Router();

const userRoute = require('./user.route');
const roleRoute = require('./role.route');
const authRoute = require('./auth.route');
const transactionRoute = require('./transaction.route');
const nftOwnerRoute = require('./nft-owner.route');
const nftOnchainRoute = require('./nft-onchain.route');
const orderOnchainRoute = require('./order-onchain.route');
const makeOfferOnchainRoute = require('./makeoffer-onchain.route');
const auctionOnchainRoute = require('./auction-onchain.route');
const bidAuctionOnchainRoute = require('./bidauction-onchain.route');
const buyOnchainRoute = require('./buy-onchain.route');

const routes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/transaction',
    route: transactionRoute,
  },
  {
    path: '/nft-owner',
    route: nftOwnerRoute,
  },
  {
    path: '/nft-onchain',
    route: nftOnchainRoute,
  },
  {
    path: '/order-onchain',
    route: orderOnchainRoute,
  },
  {
    path: '/makeoffer-onchain',
    route: makeOfferOnchainRoute,
  },
  {
    path: '/auction-onchain',
    route: auctionOnchainRoute,
  },
  {
    path: '/bidauction-onchain',
    route: bidAuctionOnchainRoute,
  },
  {
    path: '/buy-onchain',
    route: buyOnchainRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
