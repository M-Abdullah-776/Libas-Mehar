const router = require('express').Router();
const controller = require('../controllers/collection.controller');

router.get('/', controller.listAll);
router.get('/:slug', controller.getBySlug);

module.exports = router;
