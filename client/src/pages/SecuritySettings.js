import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SecurityContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background-color: #ccc;
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin: 10px 0;
`;

const SecuritySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const response = await fetch('/api/users/security-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch security settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (setting, value) => {
    try {
      const response = await fetch('/api/users/security-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [setting]: value })
      });
      
      if (!response.ok) throw new Error('Failed to update setting');
      
      setSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewActivityLog = () => {
    navigate('/activity-log');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <SecurityContainer>
      <h1>Security Settings</h1>
      
      <Section>
        <h2>Two-Factor Authentication</h2>
        <Toggle>
          <input
            type="checkbox"
            checked={settings.twoFactorEnabled}
            onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
          />
          Enable Two-Factor Authentication
        </Toggle>
        {settings.twoFactorEnabled && (
          <Button onClick={() => {/* Handle 2FA setup */}}>
            Setup 2FA
          </Button>
        )}
      </Section>

      <Section>
        <h2>Notifications</h2>
        <Toggle>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
          />
          Email Notifications
        </Toggle>
        <Toggle>
          <input
            type="checkbox"
            checked={settings.loginAlerts}
            onChange={(e) => updateSetting('loginAlerts', e.target.checked)}
          />
          Login Alerts
        </Toggle>
      </Section>

      <Section>
        <h2>Recent Activity</h2>
        <p>Last login: {user?.lastLogin || 'Never'}</p>
        <Button onClick={handleViewActivityLog}>
          View Full Activity Log
        </Button>
      </Section>
    </SecurityContainer>
  );
};

export default SecuritySettings; 