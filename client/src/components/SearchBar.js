import React, { useState } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
`;

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SearchContainer>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
        />
        <SearchButton type="submit">Search</SearchButton>
      </SearchContainer>
    </form>
  );
}

export default SearchBar;
