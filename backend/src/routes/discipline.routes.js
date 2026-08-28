const router = require('express').Router();
const controller = require('../controllers/discipline.controller');

router.get('/', controller.listAll);
router.get('/:slug', controller.getBySlug);

module.exports = router;
