const express = require('express');
const router = express.Router();
const {
  createSwap,
  getMySwaps,
  getMyPurchases,
  getSwap,
  updateSwapStatus,
  getAllSwaps,
} = require('../controllers/swapController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createSwap);
router.get('/my', protect, getMySwaps);
router.get('/my/purchases', protect, getMyPurchases);
router.get('/admin/all', protect, adminOnly, getAllSwaps);
router.get('/:id', protect, getSwap);
router.patch('/:id/status', protect, updateSwapStatus);

module.exports = router;
