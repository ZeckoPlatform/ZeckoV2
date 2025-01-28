import React from 'react';

const Pagination = ({ currentPage, setCurrentPage, hasMore }) => {
  return (
    <div>
      <button 
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
        disabled={currentPage === 1}
      >
        Previous Page
      </button>
      <span>Page {currentPage}</span>
      <button 
        onClick={() => setCurrentPage(prev => prev + 1)} 
        disabled={!hasMore}
      >
        Next Page
      </button>
    </div>
  );
};

export default Pagination; 