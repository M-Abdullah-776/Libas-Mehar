const router = require('express').Router();
const controller = require('../controllers/product.controller');

router.get('/bestsellers', controller.getBestsellers);
router.get('/search', controller.search);
router.get('/:slug', controller.getBySlug);

module.exports = router;
