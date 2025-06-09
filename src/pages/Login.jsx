import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api/auth';
import '../App.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();
  const location                = useLocation();
  const fromPath                = location.state?.from?.pathname || '/cars';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }
    try {
      const { token, role, userId } = await login(username, password);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="container form-container">
      <h2>Login</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
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
        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;