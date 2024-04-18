const express = require('express');
const { nftOwnerController } = require('../../controllers');

const router = express.Router();

router.route('/').get(nftOwnerController.getNftOwners);

router.route('/:id').get(nftOwnerController.getNftOwner);

module.exports = router;