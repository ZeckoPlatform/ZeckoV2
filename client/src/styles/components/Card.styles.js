import styled from 'styled-components';

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const CardHeader = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.default};
`;

export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

export const CardFooter = styled.div`
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.background.default};
`; 