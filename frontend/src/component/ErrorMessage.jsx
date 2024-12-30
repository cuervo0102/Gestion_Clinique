import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="min-h-screen flex justify-center items-center">
    <div className="text-red-500">{message}</div>
  </div>
);

export default ErrorMessage;