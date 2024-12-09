import React, { useState, useEffect } from 'react';

function AddNewKind({ token, onKindAdded, onKindDeleted }) {
    const [customKinds, setCustomKinds] = useState([]);
    const [newKindName, setNewKindName] = useState('');
    const [newKindType, setNewKindType] = useState('');
    // Fetch custom kinds from the server
    useEffect(() => {
        const fetchCustomKinds = async () => {
            try {
                const response = await fetch('http://localhost:3001/customized-kinds', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setCustomKinds(data);
            } catch (error) {
                console.error('Failed to fetch custom kinds:', error);
            }
        };

        fetchCustomKinds();
    }, [token]);

    // Function to add a new custom kind
    const handleAddCustomKind = async () => {
        if (!newKindType) {
            alert('請選擇類型！'); // Alert user to select a type
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/customized-kinds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newKindName, type: newKindType }),
            });

            if (response.ok) {
                const newKind = await response.json();
                setCustomKinds([...customKinds, newKind]);
                onKindAdded(newKind);
                setNewKindName('');
                setNewKindType('');
            } else {
                console.error('Failed to add custom kind:', await response.text());
            }
        } catch (error) {
            console.error('Error adding custom kind:', error);
        }
    };

    // Function to delete a custom kind
    const handleDeleteCustomKind = async (kindId) => {
        try {
            const response = await fetch(`http://localhost:3001/customized-kinds/${kindId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setCustomKinds(customKinds.filter(kind => kind._id !== kindId));
                onKindDeleted(kindId);
            } else {
                console.error('Failed to delete custom kind:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting custom kind:', error);
        }
    };

    return (
        <div>
            <h3>Custom Kinds</h3>
            <input
                type="text"
                value={newKindName}
                onChange={(e) => setNewKindName(e.target.value)}
                placeholder="Add new kind"
            />
            <select
                value={newKindType}
                onChange={(e) => setNewKindType(e.target.value)}
            >
                <option value="" disabled>選擇類型</option>
                <option value="expense">支出 (Expense)</option>
                <option value="income">收入 (Income)</option>
            </select>
            <button onClick={handleAddCustomKind}>Add Kind</button>
            <ul>
                {customKinds.map(customKind => (
                    <li key={customKind._id}>
                        {customKind.name}
                        <button onClick={() => handleDeleteCustomKind(customKind._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AddNewKind;