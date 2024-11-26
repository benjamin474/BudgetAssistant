export const fetchTransactions = async (token, setEditingTransactions) => {
    try {
        const response = await fetch('http://localhost:3001/transactions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setEditingTransactions(data);
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
    }
};