import styled, { css } from 'styled-components';
import { cardStyle } from '../mixins';

export const Card = styled.div`
  ${cardStyle};
  padding: ${({ theme }) => theme.spacing.lg};
  
  ${props => props.variant === 'glass' && css`
    ${glassEffect};
  `}
`;

export const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const CardSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

export const CardBody = styled.div`
  // Add any specific body styles
`;

export const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.text.disabled};
`; 