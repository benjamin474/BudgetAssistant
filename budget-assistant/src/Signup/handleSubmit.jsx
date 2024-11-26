const handleSubmit = (e, formData, navigate) => {
    e.preventDefault();
    
    if (formData.password !== formData.password2) {
      alert('Passwords do not match');
      return;
    }

    fetch('http://localhost:3001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Registration successful');
        navigate('/');
      }else if (data.message === 'User already exists') {
        alert('This email is already registered.');
      }else {
        alert('Registration failed: ' + data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred during registration');
    });
  };