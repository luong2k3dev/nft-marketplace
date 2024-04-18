const express = require('express');
const { nftOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(nftOnchainController.getNftOnchains);

router.route('/:id').get(nftOnchainController.getNftOnchain);

module.exports = router;
