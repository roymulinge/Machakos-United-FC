import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUserProfile, logoutUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.profile?.bio || '',
    phone_number: user?.profile?.phone_number || '',
  });
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage('Update failed');
    }
  };

  if (!user) return <p>Please login</p>;

  return (
    <div>
      <h1>Profile</h1>
      <form onSubmit={handleUpdate}>
        <input name="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
        <input name="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
        <textarea name="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
        <input name="phone_number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
        <button type="submit">Update Profile</button>
      </form>
      <button onClick={logoutUser}>Logout</button>
      {message && <p>{message}</p>}
    </div>
  );
}