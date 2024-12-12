import styled from 'styled-components';

export const AuthFormContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 2rem auto;
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AuthHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AuthTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.h2};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AuthSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.md};
`;

const FormDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.text.disabled};
  }

  span {
    padding: 0 ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }
`;

const SocialButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SocialButton = styled.button`
  ${cardStyle};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.paper};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover {
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`; 