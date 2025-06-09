import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-left">
        {token ? (
          <>
            <Link to="/cars">Cars</Link>
            <Link to="/reservations">Reservations</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>

      {token && (
        <div className="nav-right">
          <span>{username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;