import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardCard from './common/DashboardCard';
import { 
  FiBell, 
  FiShield, 
  FiGlobe, 
  FiMoon, 
  FiToggleLeft, 
  FiToggleRight,
  FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled(DashboardCard)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled}20;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SettingDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const Toggle = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ active, theme }) => 
    active ? theme.colors.primary.main : theme.colors.text.disabled};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const DeleteButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.status.error}20;
  color: ${({ theme }) => theme.colors.status.error};
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
`;

const Settings = () => {
  const { user, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    twoFactorAuth: false,
    language: 'en',
    darkMode: theme === 'dark'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        // Redirect to home page or login
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <SettingsContainer>
      <Section>
        <SectionTitle>
          <FiBell /> Notifications
        </SectionTitle>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Email Notifications</SettingTitle>
            <SettingDescription>
              Receive email notifications about your account activity
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('emailNotifications')}
            active={settings.emailNotifications}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.emailNotifications ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Push Notifications</SettingTitle>
            <SettingDescription>
              Receive push notifications on your device
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('pushNotifications')}
            active={settings.pushNotifications}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.pushNotifications ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Marketing Emails</SettingTitle>
            <SettingDescription>
              Receive updates about new features and promotions
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('marketingEmails')}
            active={settings.marketingEmails}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.marketingEmails ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>
          <FiShield /> Security
        </SectionTitle>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Two-Factor Authentication</SettingTitle>
            <SettingDescription>
              Add an extra layer of security to your account
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('twoFactorAuth')}
            active={settings.twoFactorAuth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.twoFactorAuth ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>
          <FiGlobe /> Preferences
        </SectionTitle>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Language</SettingTitle>
            <SettingDescription>
              Choose your preferred language
            </SettingDescription>
          </SettingInfo>
          <Select value={settings.language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </Select>
        </SettingRow>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Dark Mode</SettingTitle>
            <SettingDescription>
              Toggle dark mode theme
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => {
              toggleTheme();
              handleToggle('darkMode');
            }}
            active={settings.darkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.darkMode ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>

      <Section>
        <SectionTitle>
          <FiTrash2 /> Danger Zone
        </SectionTitle>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Delete Account</SettingTitle>
            <SettingDescription>
              Permanently delete your account and all associated data
            </SettingDescription>
          </SettingInfo>
          <DeleteButton
            onClick={handleDeleteAccount}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrash2 /> Delete Account
          </DeleteButton>
        </SettingRow>
      </Section>
    </SettingsContainer>
  );
};

export default Settings; 