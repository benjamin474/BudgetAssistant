const express = require('express');
const categoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware that sets req.userId

const router = express.Router();

router.route('/')
    .get(authMiddleware, categoryController.getUserCategories)
    .post(authMiddleware, categoryController.createCategory);

router.route('/:id')
    .delete(authMiddleware, categoryController.deleteCategory);

module.exports = router;
