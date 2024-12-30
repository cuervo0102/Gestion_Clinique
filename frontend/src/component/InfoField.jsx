// InfoField.js
import React from 'react';

const InfoField = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-md">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-gray-800 font-medium">{value || '--'}</div>
  </div>
);

export default InfoField;