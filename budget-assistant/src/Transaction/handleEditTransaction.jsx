export const handleEditTransaction = (transaction, setFormData, handleDeleteTransaction) => {
    setFormData({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        kind: transaction.kind,
        selectedDate: new Date(transaction.date)
    });
    handleDeleteTransaction(transaction._id);
};