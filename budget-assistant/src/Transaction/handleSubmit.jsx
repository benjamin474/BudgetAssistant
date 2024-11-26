import {jwtDecode} from 'jwt-decode';

export const handleSubmit = async (e, formData, setFormData, transactions, setTransactions, token) => {
    e.preventDefault();

    if (!token) {
        console.error('No token found. Please log in.');
        return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    const newTransaction = {
        user: userId,
        date: formData.selectedDate.toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        kind: formData.kind,
    };

    try {
        const response = await fetch('http://localhost:3001/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newTransaction),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const savedTransaction = await response.json();
        setTransactions([...transactions, savedTransaction]);
        setFormData({ ...formData, amount: '', description: '', kind: '其他' });
    } catch (error) {
        console.error(`Failed to save transaction: ${error.message}`);
    }
};