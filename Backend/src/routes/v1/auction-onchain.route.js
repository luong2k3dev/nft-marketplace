const express = require('express');
const { auctionOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auctionOnchainController.getAuctionOnchains);

router.route('/:id').get(auctionOnchainController.getAuctionOnchain);

module.exports = router;
