const router = require('express').Router();
const controller = require('../controllers/address.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', controller.listMine);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

module.exports = router;
