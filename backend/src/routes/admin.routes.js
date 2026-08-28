const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', ctrl.getStats);

// Products
router.get('/products', ctrl.getAllProducts);
router.post('/products', ctrl.createProduct);
router.patch('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Orders
router.get('/orders', ctrl.getAllOrders);
router.patch('/orders/:id/status', ctrl.updateOrderStatus);

// Users
router.get('/users', ctrl.getAllUsers);
router.post('/users', ctrl.createUser);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.delete('/users/:id', ctrl.deleteUser);

// Collections
router.get('/collections', ctrl.getAllCollections);
router.post('/collections', ctrl.createCollection);
router.patch('/collections/:id', ctrl.updateCollection);
router.delete('/collections/:id', ctrl.deleteCollection);

// Newsletter
router.get('/newsletter', ctrl.getSubscribers);
router.post('/newsletter/send', ctrl.sendNewsletter);

module.exports = router;
