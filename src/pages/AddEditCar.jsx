import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCar, createCar, updateCar } from '../api/cars';
import '../App.css';

const AddEditCar = () => {
  const { id }       = useParams();
  const isEdit       = Boolean(id);
  const navigate     = useNavigate();

  const [form, setForm]     = useState({
    brand: '', model: '', year: '', pricePerDay: '', available: false
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await getCar(id);
        setForm({
          brand: data.brand,
          model: data.model,
          year: data.year?.toString() || '',
          pricePerDay: data.pricePerDay.toString(),
          available: !data.reserved
        });
      } catch {
        setError('Failed to load car.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==='checkbox'? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.brand || !form.model || !form.year || !form.pricePerDay) {
      setError('Please fill all required fields.');
      return;
    }
    const payload = {
      brand: form.brand,
      model: form.model,
      year: parseInt(form.year,10),
      pricePerDay: parseFloat(form.pricePerDay),
      reserved: !form.available
    };
    try {
      isEdit ? await updateCar(id, payload) : await createCar(payload);
      navigate('/cars');
    } catch {
      setError(isEdit? 'Update failed.' : 'Add failed.');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="container form-container">
      <h2>{isEdit? 'Edit Car' : 'Add New Car'}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Brand*</label>
          <input name="brand" value={form.brand} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Model*</label>
          <input name="model" value={form.model} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Year*</label>
          <input name="year" type="number" value={form.year} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Price per Day*</label>
          <input name="pricePerDay" type="number" step="0.01"
                 value={form.pricePerDay} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>
            <input name="available" type="checkbox"
                   checked={form.available} onChange={handleChange}/>
            {' '}Available
          </label>
        </div>
        <button className="button" type="submit">
          {isEdit? 'Update Car' : 'Add Car'}
        </button>
      </form>
    </div>
  );
};

export default AddEditCar;