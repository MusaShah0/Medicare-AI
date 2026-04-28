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
    let cancelled = false;
    const API = import.meta.env.VITE_API_URL;

    const check = async () => {
      try {
        if (role === 'any') {
          await Promise.any([
            axios.get(`${API}/doctor/verify`,  { withCredentials: true }),
            axios.get(`${API}/patient/verify`, { withCredentials: true }),
          ]);
        } else {
          const endpoint = role === 'doctor'
            ? `${API}/doctor/verify`
            : `${API}/patient/verify`;
          await axios.get(endpoint, { withCredentials: true });
        }
        if (!cancelled) setStatus('authenticated');
      } catch {
        if (!cancelled) setStatus('unauthenticated');
      }
    };

    check();
    return () => { cancelled = true; };
  }, [role]);

  return status;
};

export default useAuth;
