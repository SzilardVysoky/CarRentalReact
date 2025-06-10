const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.server' });

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: 'http://localhost:3000',            // React origin
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
  })
);
app.use(bodyParser.json());

const MONGO_URI= process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to MongoDB');
  createAdminUser();
})
.catch(err => console.error('Failed to connect to MongoDB:', err));

/** 
 * USER
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'user'
  }
});

const User = mongoose.model('User', userSchema);
const JWT_SECRET = process.env.JWT_SECRET;

const createAdminUser = async () => {
const existingAdmin = await User.findOne({ username: 'Admin' });
if (!existingAdmin) {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = new User({ username: 'Admin', password: hashedPassword, role: 'admin' });
  await adminUser.save();
  console.log('Admin user created');
} else {
  console.log('Admin user already exists.');
}
};

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed }).save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
const { username, password } = req.body;

try {
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ token, role: user.role, userId: user._id});
} catch (err) {
  res.status(500).json({ message: 'Error logging in', error: err.message });
}
});

/**
 * Car
 */

const carSchema = new mongoose.Schema({
brand: { type: String, required: true },
model: { type: String, required: true },
year: {type: Number},
pricePerDay: { type: Number, required: true },
reserved: { type: Boolean, default: false },
reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
reservedDays: { type: Number, default: 0 },
});

const Car = mongoose.model('Car', carSchema);

// Get Cars
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).send('Error fetching cars');
  }
});

// Post cars
app.post('/api/cars', async (req, res) => {
  try {
    const { brand, model, year, pricePerDay, reserved } = req.body;
    const newCar = new Car({ brand, model, year, pricePerDay, reserved });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).send('Error adding car: ' + err.message);
  }
});

// Get a single car by id
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send('Car not found');
    res.json(car);
  } catch (err) {
    res.status(500).send('Error fetching car details');
  }
});

// Delete car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Car.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send('Car not found');
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(400).send('Error deleting car: ' + err.message);
  }
});

// Update Car
app.put('/api/cars/:id', async (req, res) => {
const { id } = req.params;
const { brand, model, year, pricePerDay, reserved } = req.body;

try {
  const updatedCar = await Car.findByIdAndUpdate(id, { brand, model, year, pricePerDay, reserved }, { new: true });

  if (!updatedCar) {
    return res.status(404).send('Car not found');
  }

  res.json(updatedCar);
} catch (err) {
  console.error('Error updating car:', err);
  res.status(500).send('Error updating car');
}
});

/**
 * Reservations
 */

const reservationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  days:       { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  reservedAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// Reserve a Car
app.post('/api/reservations', async (req, res) => {
const { userId, carId, days } = req.body;

try {
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  if (car.reserved) {
    return res.status(400).json({ message: 'Car is already reserved.' });
  }

  car.reserved = true;
  car.reservedBy = userId;
  car.reservedDays = days;
  await car.save();

  const totalPrice = car.pricePerDay * days;
  const reservation = new Reservation({ userId, carId, days, totalPrice });
  await reservation.save();

  res.status(201).json(reservation);
} catch (err) {
  console.error('Error reserving car:', err);
  res.status(500).json({ message: 'Error reserving car' });
}
});

// Verify token
const verifyToken = (req, res, next) => {
const token = req.headers.authorization?.split(' ')[1];

if (!token) {
  return res.status(401).json({ message: 'No token provided' });
}

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
} catch (err) {
  console.error('Token verification failed:', err);
  return res.status(403).json({ message: 'Invalid token' });
}
};

// Get Reservations by User
app.get('/api/reservations/user/:userId', verifyToken, async (req, res) => {
console.log('Fetching reservations for user ID:', req.params.userId);
try {
  const reservations = await Reservation.find({ userId: req.params.userId })
    .populate('carId')
    .populate('userId', 'username');

  res.json(reservations);
} catch (err) {
  console.error('Error fetching user reservations:', err);
  res.status(500).json({ message: 'Error fetching reservations' });
}
});

// Get reservations for Admin
app.get('/api/reservations/all', verifyToken, async (req, res) => {
try {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const reservations = await Reservation.find()
    .populate('userId', 'username')
    .populate('carId');

  res.json(reservations);
} catch (err) {
  console.error('Error fetching all reservations:', err);
  res.status(500).json({ message: 'Error fetching all reservations' });
}
});

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});