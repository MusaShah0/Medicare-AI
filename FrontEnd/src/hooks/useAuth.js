import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Verifies the httpOnly JWT cookie against the backend.
 * Returns 'loading' | 'authenticated' | 'unauthenticated'
 *
 * @param {'doctor'|'patient'|'any'} role
 *   'any' — succeeds if the user is authenticated as either role
 */
const useAuth = (role) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    if (role === 'any') {
      Promise.any([
        axios.get(`${API}/doctor/verify`,  { withCredentials: true }),
        axios.get(`${API}/patient/verify`, { withCredentials: true }),
      ])
        .then(() => setStatus('authenticated'))
        .catch(() => setStatus('unauthenticated'));
      return;
    }

    const endpoint =
      role === 'doctor'
        ? `${API}/doctor/verify`
        : `${API}/patient/verify`;

    axios
      .get(endpoint, { withCredentials: true })
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, [role]);

  return status;
};

export default useAuth;
