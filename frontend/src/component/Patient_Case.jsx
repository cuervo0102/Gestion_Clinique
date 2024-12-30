import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoField from './InfoField';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PatientCase = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Fetching data with userId:', userId);
  
        const response = await fetch(`http://localhost:8080/patient/${userId}`, {
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Received data:', data);
        
        setPatient(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPatientData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Patient Information</h1>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoField label="Full Name" value={patient.fullName} />
            <InfoField label="CNI" value={patient.cni} />
            <InfoField label="Email" value={patient.email} />
            <InfoField label="Phone" value={patient.phoneNumber} />
            <InfoField label="Age" value={patient.age} />
            <InfoField label="Gender" value={patient.gender} />
            <InfoField label="City" value={patient.city} />
            <InfoField label="Doctor" value={patient.doctorName} />
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Health Problem</h2>
            <div className="bg-gray-50 p-4 rounded-md">{patient.healthProblem}</div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Registered on: {new Date(patient.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCase;