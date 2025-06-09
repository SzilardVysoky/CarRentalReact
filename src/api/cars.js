import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Fetch all cars.
 */
export async function getCars() {
  const response = await axios.get(`${API_URL}/cars`);
  return response.data; // expect array of cars
}

/**
 * Fetch a single car by ID.
 */
export async function getCar(id) {
  const response = await axios.get(`${API_URL}/cars/${id}`);
  return response.data;
}

/**
 * Create a new car.
 * carData = { make, model, year, pricePerDay, available }
 */
export async function createCar(carData) {
  const response = await axios.post(`${API_URL}/cars`, carData);
  return response.data;
}

/**
 * Update an existing car by ID.
 */
export async function updateCar(id, carData) {
  const response = await axios.put(`${API_URL}/cars/${id}`, carData);
  return response.data;
}

/**
 * Delete a car by ID.
 */
export async function deleteCar(id) {
  const response = await axios.delete(`${API_URL}/cars/${id}`);
  return response.data;
}