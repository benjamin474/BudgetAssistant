import { format, addMonths, addYears } from 'date-fns';
import { handleTransactionAdd } from './handleTransactionAdd';

export const handleAddRecurringTransaction = async (e, startDate, amount, description, type, kind, setFormData, transactions, setTransactions, endDate, token, recurringFrequency) => {
    e.preventDefault();
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        await handleTransactionAdd(e, currentDate, amount, description, type, kind, null, setFormData, transactions, setTransactions, token);
        if (recurringFrequency === 'monthly') {
            currentDate = addMonths(currentDate, 1);
        } else if (recurringFrequency === 'yearly') {
            currentDate = addYears(currentDate, 1);
        }
    }
};