import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

// Create a new reservation
export async function createReservation({ userId, carId, days }, token) {
  const response = await axios.post(
    `${API_URL}/reservations`,
    { userId, carId, days },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Fetch reservations for the current user
export async function getUserReservations(userId, token) {
  const response = await axios.get(
    `${API_URL}/reservations/user/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Fetch all reservations (admin only)
export async function getAllReservations(token) {
  const response = await axios.get(
    `${API_URL}/reservations/all`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}