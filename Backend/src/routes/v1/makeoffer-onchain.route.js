const express = require('express');
const { makeofferOnchainController } = require('../../controllers');

const router = express.Router();

router.route('/').get(makeofferOnchainController.getMakeOfferOnchains);

router.route('/:id').get(makeofferOnchainController.getMakeOfferOnchain);

module.exports = router;
