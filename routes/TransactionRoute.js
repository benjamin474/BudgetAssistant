const express = require('express');
const transactionController = require('../controllers/TransactionController');
const authMiddleware = require('../middleware/authMiddleware'); // Assume this middleware sets req.userId

const router = express.Router();

router.route('/')
    .get(authMiddleware, transactionController.getAllTransaction)
    .post(authMiddleware, transactionController.createTransaction);

router.route('/:id')
    .delete(authMiddleware, transactionController.deleteTransaction);

module.exports = router;