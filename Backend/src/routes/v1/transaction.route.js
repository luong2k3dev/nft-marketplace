const express = require('express');
const { transactionController } = require('../../controllers');

const router = express.Router();

router.route('/').get(transactionController.getTransactions);

router.route('/:id').get(transactionController.getTransaction);

module.exports = router;
