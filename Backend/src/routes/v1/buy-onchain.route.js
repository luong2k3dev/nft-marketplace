const express = require('express');
const { buyOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(buyOnchainController.getBuyOnchains);

router.route('/:id').get(buyOnchainController.getBuyOnchain);

module.exports = router;
