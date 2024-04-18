const express = require('express');
const { orderOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(orderOnchainController.getOrderOnchains);

router.route('/:id').get(orderOnchainController.getOrderOnchain);

module.exports = router;
