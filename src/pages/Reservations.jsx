import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getUserReservations,
  getAllReservations,
  createReservation
} from '../api/reservations';
import { getCars } from '../api/cars';
import '../App.css';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const Reservations = () => {
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [cars, setCars]                 = useState([]);
  const [selectedCar, setSelectedCar]   = useState(location.state?.selectedCar || '');
  const [days, setDays]                 = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [sortConfig, setSortConfig]     = useState({ key: null, direction: 'asc' });

  const role   = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const token  = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const data = role === 'admin'
          ? await getAllReservations(token)
          : await getUserReservations(userId, token);
        setReservations(data);

        const allCars = await getCars();
        setCars(allCars.filter(c => !c.reserved));
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [role, userId, token]);

  const requestSort = key => {
    let dir = 'asc';
    if (sortConfig.key===key && sortConfig.direction==='asc') dir='desc';
    setSortConfig({ key, direction: dir });
  };

  // Filter out expired, compute remaining ms
  const now = Date.now();
  const valid = reservations
  .map(r => {
    const reservedAt = new Date(r.reservedAt).getTime();
    const expiresAt = reservedAt + r.days * ONE_DAY_MS;
    return { ...r, remaining: expiresAt - Date.now() };
  })
  .filter(r => r.remaining > 0 && r.carId);

  // Sort
  const sorted = [...valid].sort((a, b) => {
  const { key, direction } = sortConfig;
  if (!key) return 0;

  let aVal, bVal;
  switch (key) {
    case 'car':
      aVal = `${a.carId.brand} ${a.carId.model}`.toLowerCase();
      bVal = `${b.carId.brand} ${b.carId.model}`.toLowerCase();
      break;
      case 'remaining':
        aVal = a.remaining;
        bVal = b.remaining;
        break;
      case 'pricePerDay':
        aVal = a.carId.pricePerDay;
        bVal = b.carId.pricePerDay;
        break;
      case 'totalPrice':
        aVal = a.carId.pricePerDay * a.days;
        bVal = b.carId.pricePerDay * b.days;
        break;
      case 'userId':
        aVal = a.userId.username.toLowerCase();
        bVal = b.userId.username.toLowerCase();
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return direction==='asc'? -1:1;
    if (aVal > bVal) return direction==='asc'? 1:-1;
    return 0;
  });

  const handleReserve = async e => {
    e.preventDefault();
    setError('');
    if (!selectedCar || !days) {
      setError('Please select a car and days.');
      return;
    }
    try {
      await createReservation({ userId, carId: selectedCar, days: parseInt(days,10) }, token);
      const updated = role==='admin'
        ? await getAllReservations(token)
        : await getUserReservations(userId, token);
      setReservations(updated);
      setSelectedCar(''); setDays('');
    } catch {
      setError('Reservation failed.');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="container">
      <h2>Reservations</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th onClick={()=>requestSort('car')}>Car {sortConfig.key==='car'?(sortConfig.direction==='asc'?'↑':'↓'):''}</th><th>Days Reserved</th>
            <th onClick={()=>requestSort('remaining')}>Remaining {sortConfig.key==='remaining'?(sortConfig.direction==='asc'?'↑':'↓'):''}</th>
            <th onClick={()=>requestSort('pricePerDay')}>Price/Day {sortConfig.key==='pricePerDay'?(sortConfig.direction==='asc'?'↑':'↓'):''}</th>
            <th onClick={()=>requestSort('totalPrice')}>Total {sortConfig.key==='totalPrice'?(sortConfig.direction==='asc'?'↑':'↓'):''}</th>
            {role==='admin' && <th onClick={()=>requestSort('userId')}>User {sortConfig.key==='userId'?(sortConfig.direction==='asc'?'↑':'↓'):''}</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => {
            const daysLeft = Math.floor(r.remaining / ONE_DAY_MS);
            const hoursLeft = Math.floor((r.remaining % ONE_DAY_MS) / (60*60*1000));
            const minutesLeft = Math.floor((r.remaining % (60 * 60 * 1000)) / (60 * 1000));
            return (
              <tr key={r._id}>
                <td>{r.carId.brand} {r.carId.model}</td>
                <td>{r.days}</td>
                <td>{daysLeft}d {hoursLeft}h {minutesLeft}m</td>
                <td>{r.carId.pricePerDay.toFixed(2)} €</td>
                <td>{(r.carId.pricePerDay * r.days).toFixed(2)} €</td>
                {role==='admin' && <td>{r.userId.username}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>

      {role!=='admin'&&(
        <form onSubmit={handleReserve}>
          <div className="form-group">
            <label>Choose Car</label>
            <select value={selectedCar} onChange={e=>setSelectedCar(e.target.value)}>
              <option value="">-- select --</option>
              {cars.map(c=>(
                <option key={c._id} value={c._id}>
                  {c.brand} {c.model} – {c.pricePerDay} €/day
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Days</label>
            <input type="number" value={days} onChange={e=>setDays(e.target.value)}/>
          </div>
          <button className="button" type="submit">Reserve</button>
        </form>
      )}
    </div>
  );
};

export default Reservations;