export const handleEditTransaction = async (id, transaction, token) => {
    try {
        const response = await fetch(`http://localhost:3001/api/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transaction)
        });
        if (response.ok) {
            alert('交易更新成功！');
        } else {
            alert('更新失敗，請稍後再試');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
    }
};