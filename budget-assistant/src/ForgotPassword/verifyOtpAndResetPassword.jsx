export const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
    try {
        const response = await fetch('http://localhost:3001/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                newPassword,
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            alert(`Error: ${errorMessage}`);
        } else {
            alert('Password reset successful');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('There was an error resetting your password. Please try again.');
    }
};