export const fetchUserInfo = async (token, setUserInfo, setNewUsername, setNewEmail) => {
    try {
        const response = await fetch('http://localhost:3001/api/users/info', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            setUserInfo(data.user);
            setNewUsername(data.user.username);
            setNewEmail(data.user.email);
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
};