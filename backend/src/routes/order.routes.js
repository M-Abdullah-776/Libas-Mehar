const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { checkoutLimiter } = require('../middleware/rateLimiter');

// Public guest order tracking
router.get('/track', controller.trackOrder);

// Authenticated routes
router.use(requireAuth);

router.post('/checkout', checkoutLimiter, controller.checkout);
router.get('/', controller.listMyOrders);
router.get('/:id', controller.getOrder);

// admin-only
router.patch('/:id/status', requireAdmin, controller.updateStatus);

module.exports = router;
