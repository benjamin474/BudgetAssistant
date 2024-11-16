const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date: String,
    amount: Number,
    description: String,
    type: String,
    kind: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
