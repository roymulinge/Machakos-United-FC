import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerUser(formData);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
      <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
      <input type="password" name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} required />
      <button type="submit">Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}