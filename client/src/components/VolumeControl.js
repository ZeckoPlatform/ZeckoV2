import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Volume1, Volume2, VolumeX } from 'react-feather';

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid #eee;
`;

const VolumeSlider = styled.input`
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: #ddd;
  outline: none;
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const VolumeIcon = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

const TestButton = styled.button`
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

function VolumeControl() {
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('notificationVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('notificationVolume', newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    const newVolume = volume === 0 ? 0.5 : 0;
    setVolume(newVolume);
    localStorage.setItem('notificationVolume', newVolume);
  }, [volume]);

  const playTestSound = useCallback(() => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = volume;
      audio.play().catch(() => {
        console.error('Failed to play test sound');
      });
    } catch (error) {
      console.error('Error playing test sound:', error);
    }
  }, [volume]);

  const getVolumeIcon = useCallback(() => {
    if (volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  }, [volume]);

  return (
    <VolumeContainer>
      <VolumeIcon onClick={toggleMute}>
        {getVolumeIcon()}
      </VolumeIcon>
      <VolumeSlider
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
      />
      <TestButton onClick={playTestSound}>
        Test
      </TestButton>
    </VolumeContainer>
  );
}

export default VolumeControl; 