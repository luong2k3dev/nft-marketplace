const express = require('express');
const { bidauctionOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(bidauctionOnchainController.getBidAuctionOnchains);

router.route('/:id').get(bidauctionOnchainController.getBidAuctionOnchain);

module.exports = router;
