import React, { useState, useEffect } from 'react';

function BusinessProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/dashboard/business-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData(profileData);
      } else {
        throw new Error('Failed to fetch business profile');
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/dashboard/business-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
        alert('Business profile updated successfully!');
      } else {
        throw new Error('Failed to update business profile');
      }
    } catch (error) {
      console.error('Error updating business profile:', error);
      alert('Failed to update business profile. Please try again.');
    }
  };

  if (!profile) {
    return <div>Loading business profile...</div>;
  }

  return (
    <div>
      <h3>Business Profile</h3>
      {editing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Business Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="website">Website:</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      ) : (
        <div>
          <h4>Business Name:</h4>
          <p>{profile.name}</p>
          <h4>Description:</h4>
          <p>{profile.description}</p>
          <h4>Address:</h4>
          <p>{profile.address}</p>
          <h4>Phone:</h4>
          <p>{profile.phone}</p>
          <h4>Website:</h4>
          <p>{profile.website}</p>
        </div>
      )}
    </div>
  );
}

export default BusinessProfile;
