import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with:', { name, email });
      const response = await api.post('/auth/register', { name, email, password });
      console.log('Registration successful:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err?.response?.data?.error || err?.message || 'Registration failed - check console';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fb'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>GearGuard — Register</h1>
        
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />

          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          <input
            type="password"
            placeholder="password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          {error && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              background: '#d1fae5',
              color: '#059669',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              Registration successful! Redirecting to login...
            </div>
          )}
          
          <button
            type="submit"
            className="btn"
            style={{ width: '100%' }}
            disabled={success || loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}