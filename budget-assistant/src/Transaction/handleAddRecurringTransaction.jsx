import { format, addMonths } from 'date-fns';
import { handleTransactionAdd } from './handleTransactionAdd';

export const handleAddRecurringTransaction = async (e, startDate, amount, description, type, kind, setFormData, transactions, setTransactions, endDate, token) => {
    e.preventDefault();
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        await handleTransactionAdd(e, currentDate, amount, description, type, kind, null, setFormData, transactions, setTransactions, token);
        currentDate = addMonths(currentDate, 1);
    }
};
