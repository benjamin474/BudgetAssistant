import React, { useState, useEffect } from 'react';

const AddNewKind = ({ token, onKindAdd, onKindDeleted }) => {
    const [customKinds, setCustomKinds] = useState([]);
    const [newKindName, setNewKindName] = useState('');
    cosnt[newKindType, setNewKindType] = useState('expense');

    useEffect(() => {
        const fetchCustomKinds = async () => {
            try {
                const response = await fetch('http://localhost:3001/customized-kinds', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch custom kinds');
                }

                const data = await response.json();
                setCustomKinds(data);
            } catch (error) {
                console.error('Failed to fetch custom kinds: ', error);
            }
        };

        fetchCustomKinds();
    }, [token]);

    const handleAddKind = async () => {
        try {
            const response = await fetch('http://localhost:3001/customized-kinds', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ name: newKindName, type: newKindType }),
            });

            if (!response.ok) {
                throw new Error('Failed to add new kind');
            }

            const newKind = await response.json();
            setCustomKinds([...customKinds, newKind]);
            onKindAdd(newKind);
            setNewKindName('');
        } catch (error) {
            console.error('Failed to add the new kind: ', error);
        }
    };

    const handleDeleteKind = async (kindId) => {
        try {
            await fetch(`https://localhost:3001//customized-kinds/${kindId}`, {
                method: 'DELETE';
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCustomKinds(customKinds.filter((kind) => kind._id !== kindId));
            onKindDeleted(kindId);
        } catch (error) {
            console.error("Failed to delete the kind: ", error);
        }
    };

    return (
        <div>
            <h3>自定義分類</h3>
            <div>
                <input
                    type="text"
                    value={newKindName}
                    onChange={(e) => setNewKindName(e.target.value)}
                    placeholder='請輸入新分類名稱'
                />
                <select value={newKindType} onChange={(e) => setNewKindType(e.target.value)}>
                    <option value="expense">支出</option>
                    <option value="income">收入</option>
                </select>
                <button onClick={handleAddKind}>新增分類</button>
            </div>
            <ul>
                {customKinds.map((kind)=>(
                    <li key={kind._id}>
                        {kind.name} ({kind.type})
                        <button onClick={()=>handleDeleteKind(kind._id)}>刪除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AddNewKind;