import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        businessName: '',
        email: '',
        phone: '',
        description: '',
        website: '',
        category: '',
        addresses: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/business/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                // Ensure all fields have default values
                setProfile({
                    businessName: data.businessName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || '',
                    website: data.website || '',
                    category: data.category || '',
                    addresses: Array.isArray(data.addresses) ? data.addresses : []
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Handle error appropriately
            }
        };

        fetchProfile();
    }, []);

    const handleNavigation = (path) => {
        try {
            navigate(path);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <div>
            <h2>Business Profile</h2>
            {/* Rest of your profile component */}
        </div>
    );
};

export default BusinessProfile;
