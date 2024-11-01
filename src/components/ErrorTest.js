import React from 'react';

function ErrorTest() {
  throw new Error('Test error');
  return <div>This won't be rendered</div>;
}

export default ErrorTest;
