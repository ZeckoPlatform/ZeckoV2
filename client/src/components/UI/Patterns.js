import styled from 'styled-components';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${props => props.minWidth || '300px'}, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  
  ${respondTo.md`
    grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
  `}
`;

export const Masonry = styled.div`
  column-count: 1;
  column-gap: ${({ theme }) => theme.spacing.lg};

  ${respondTo.sm`
    column-count: 2;
  `}

  ${respondTo.lg`
    column-count: 3;
  `}

  > * {
    break-inside: avoid;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  
  > * {
    flex: 1 1 ${props => props.itemWidth || '300px'};
  }
`; 