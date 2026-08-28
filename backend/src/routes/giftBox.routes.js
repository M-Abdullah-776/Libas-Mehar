const router = require('express').Router();
const controller = require('../controllers/giftBox.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', controller.createDraft);
router.patch('/:id/items', controller.setItems);
router.post('/:id/add-to-cart', controller.addToCart);

module.exports = router;
