const router = require('express').Router();
const controller = require('../controllers/review.controller');
const { requireAuth } = require('../middleware/auth');

// Public route to view reviews
router.get('/:productId/reviews', controller.getProductReviews);

// Protected route to create review
router.post('/:productId/reviews', requireAuth, controller.createReview);

module.exports = router;
