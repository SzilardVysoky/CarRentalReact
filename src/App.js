import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import CarList from './pages/CarList';
import AddEditCar from './pages/AddEditCar';
import Reservations from './pages/Reservations';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/cars"
            element={
              <PrivateRoute>
                <CarList />
              </PrivateRoute>
            }
          />
          <Route
            path="/cars/add"
            element={
              <PrivateRoute>
                <AddEditCar />
              </PrivateRoute>
            }
          />
          <Route
            path="/cars/edit/:id"
            element={
              <PrivateRoute>
                <AddEditCar />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <PrivateRoute>
                <Reservations />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;