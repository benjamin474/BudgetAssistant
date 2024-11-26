export const handleSubmit = async (e, formData, navigate) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3001/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Signup failed');
        } else {
            const data = await response.json();
            if (data.success) {
                alert('Signup successful');
                navigate('/login');
            }
        }
    } catch (error) {
        alert('Signup error');
        console.error('Signup error:', error);
    }
};