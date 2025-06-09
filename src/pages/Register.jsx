import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import '../App.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const navigate               = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError('Username must be 3–20 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be ≥ 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register(username, password);
      setSuccess('Registration successful! Redirecting…');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div className="container form-container" style={{ textAlign: 'center' }}>
        <h2>Register</h2>
        <div className="alert alert-success">{success}</div>
      </div>
    );
  }

  return (
    <div className="container form-container">
      <h2>Register</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>
        <button className="button" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;