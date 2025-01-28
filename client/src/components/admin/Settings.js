import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiSettings, 
  FiMail, 
  FiDatabase,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';

const AdminSettingsContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h4`
  margin: 0 0 5px 0;
  color: #333;
`;

const SettingDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const Toggle = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ active }) => active ? '#4CAF50' : '#ccc'};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    systemEmails: true,
    dataBackup: true,
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <AdminSettingsContainer>
      <Section>
        <h2><FiSettings /> System Settings</h2>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Maintenance Mode</SettingTitle>
            <SettingDescription>
              Enable maintenance mode to temporarily disable user access
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('maintenanceMode')}
            active={settings.maintenanceMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.maintenanceMode ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>

      <Section>
        <h2><FiMail /> Email Settings</h2>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>System Emails</SettingTitle>
            <SettingDescription>
              Enable/disable system-wide email notifications
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('systemEmails')}
            active={settings.systemEmails}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.systemEmails ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>

      <Section>
        <h2><FiDatabase /> Data Management</h2>
        <SettingRow>
          <SettingInfo>
            <SettingTitle>Automated Backups</SettingTitle>
            <SettingDescription>
              Enable/disable automated system backups
            </SettingDescription>
          </SettingInfo>
          <Toggle
            onClick={() => handleToggle('dataBackup')}
            active={settings.dataBackup}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {settings.dataBackup ? <FiToggleRight /> : <FiToggleLeft />}
          </Toggle>
        </SettingRow>
      </Section>
    </AdminSettingsContainer>
  );
};

export default AdminSettings; 