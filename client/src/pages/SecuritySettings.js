import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
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

  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState('');

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

  const setup2FA = async () => {
    try {
      const response = await fetch('/api/users/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to setup 2FA');
      
      const data = await response.json();
      setTwoFactorSecret(data.secret);
      setShowTwoFactorModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const verify2FA = async () => {
    try {
      const response = await fetch('/api/users/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode,
          secret: twoFactorSecret
        })
      });

      if (!response.ok) throw new Error('Invalid verification code');

      await updateSetting('twoFactorEnabled', true);
      setShowTwoFactorModal(false);
      setVerificationCode('');
      setSetupError('');
    } catch (err) {
      setSetupError(err.message);
    }
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
          <Button onClick={setup2FA}>
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

      {showTwoFactorModal && (
        <Modal>
          <ModalContent>
            <h3>Setup Two-Factor Authentication</h3>
            <p>Scan this QR code with your authenticator app:</p>
            {twoFactorSecret && (
              <QRCodeSVG 
                value={`otpauth://totp/${user.email}?secret=${twoFactorSecret}&issuer=YourApp`}
                size={256}
              />
            )}
            <Input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            {setupError && <p style={{ color: 'red' }}>{setupError}</p>}
            <ButtonGroup>
              <Button onClick={verify2FA}>Verify</Button>
              <Button 
                onClick={() => {
                  setShowTwoFactorModal(false);
                  setVerificationCode('');
                  setSetupError('');
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </SecurityContainer>
  );
};

export default SecuritySettings; 