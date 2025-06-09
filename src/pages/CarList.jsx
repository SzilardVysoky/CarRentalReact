import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, deleteCar } from '../api/cars';
import '../App.css';

const CarList = () => {
  const [cars, setCars]         = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate                = useNavigate();
  const role                    = localStorage.getItem('role');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCars();
        setCars(role === 'admin' ? data : data.filter(c => !c.reserved));
      } catch {
        setError('Failed to load cars. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCars = [...cars].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    let aVal = a[key], bVal = b[key];
    if (key === 'reserved') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0; }
    if (aVal < bVal) return direction==='asc'? -1:1;
    if (aVal > bVal) return direction==='asc'? 1:-1;
    return 0;
  });

  if (loading) return <p>Loading cars…</p>;

  return (
    <div className="container">
      <h2>Cars</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {role==='admin' && (
        <button className="button" onClick={() => navigate('/cars/add')}>
          Add New Car
        </button>
      )}

      {sortedCars.length === 0 ? (
        <p>No cars available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => requestSort('brand')}>Brand {sortConfig.key==='brand'? (sortConfig.direction==='asc'?'↑':'↓'):''}</th>
              <th onClick={() => requestSort('year')}>Year {sortConfig.key==='year'? (sortConfig.direction==='asc'?'↑':'↓'):''}</th>
              <th onClick={() => requestSort('pricePerDay')}>Price/Day {sortConfig.key==='pricePerDay'? (sortConfig.direction==='asc'?'↑':'↓'):''}</th>
              {role==='admin' && <th onClick={() => requestSort('reserved')}>Available {sortConfig.key==='reserved'? (sortConfig.direction==='asc'?'↑':'↓'):''}</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCars.map(car => (
              <tr key={car._id}>
                <td>{car.brand}</td>
                <td>{car.year}</td>
                <td>{car.pricePerDay}</td>
                {role==='admin' && <td>{car.reserved? 'No':'Yes'}</td>}
                <td>
                  {role==='admin'? (
                    <>
                      <button
                        className="button"
                        style={{ marginRight: '0.5rem' }}
                        onClick={() => navigate(`/cars/edit/${car._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-delete"
                        onClick={async () => {
                          if (!window.confirm('Delete this car?')) return;
                          try {
                            await deleteCar(car._id);
                            setCars(prev => prev.filter(c => c._id !== car._id));
                          } catch {
                            setError('Failed to delete car.');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button className="button" onClick={() => navigate('/reservations', {state:{selectedCar:car._id}})}>
                      Reserve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CarList;
