const Transaction = require('../models/TransactionModel');

exports.createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Creating transaction for user:', userId);
    const transactionData = {
      ...req.body,
      user: userId,
    };

    if (req.file) {
      transactionData.file = req.file.buffer; // Store file buffer
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).send(transaction); // 201 Created
    } catch (error) {
        res.status(400).send(`Error creating transaction: ${error.message}`); // 400 Bad Request
    }
};

exports.getUserTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.userId });
        res.send(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send(`Error fetching transactions: ${error.message}`); // 500 Internal Server Error
    }
};

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        await Transaction.findByIdAndDelete(id);
        res.status(200).send(`Transaction with id ${id} deleted successfully.`);
    } catch (error) {
        res.status(500).send(`Error deleting transaction: ${error.message}`);
    }
};