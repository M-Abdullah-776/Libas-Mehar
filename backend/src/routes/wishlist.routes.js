const router = require('express').Router();
const controller = require('../controllers/wishlist.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', controller.getWishlist);
router.post('/toggle', controller.toggleWishlist);

module.exports = router;
