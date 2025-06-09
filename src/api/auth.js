import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Register a new user.
 * Expects { username, password } in the body.
 */
export async function register(username, password) {
  const response = await axios.post(
    `${API_URL}/auth/register`,
    { username, password }
  );
  return response.data; 
}

/**
 * Log in an existing user.
 * Expects { username, password } in the body.
 * Returns { token, role, userId }.
 */
export async function login(username, password) {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    { username, password }
  );
  return response.data;
}