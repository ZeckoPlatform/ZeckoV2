import styled from 'styled-components';

export const Avatar = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: ${({ theme }) => theme?.borderRadius?.round || '50%'};
  background: ${({ theme }) => theme?.colors?.primary?.gradient || 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)'};
  color: ${({ theme }) => theme?.colors?.primary?.text || '#FFFFFF'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme?.typography?.weight?.medium || 500};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`; 