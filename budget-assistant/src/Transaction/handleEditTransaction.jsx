export const handleEditTransaction = (transaction, setFormData, handleDeleteTransaction, transactions, setTransactions, token) => {
    setFormData({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        kind: transaction.kind,
        selectedDate: new Date(transaction.date)
    });
    handleDeleteTransaction(transaction._id, transactions, setTransactions, token);
};