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
    if (role === 'any') {
      // Try both; authenticated if either succeeds
      Promise.any([
        axios.get('http://localhost:4000/doctor/verify',  { withCredentials: true }),
        axios.get('http://localhost:4000/patient/verify', { withCredentials: true }),
      ])
        .then(() => setStatus('authenticated'))
        .catch(() => setStatus('unauthenticated'));
      return;
    }

    const endpoint =
      role === 'doctor'
        ? 'http://localhost:4000/doctor/verify'
        : 'http://localhost:4000/patient/verify';

    axios
      .get(endpoint, { withCredentials: true })
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, [role]);

  return status;
};

export default useAuth;
