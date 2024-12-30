import React, { useState, useEffect } from 'react';
import Calendar from './calender';

const PatientTable = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/patients');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Failed to fetch patients: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (patientId) => {
    const doctorId = prompt('Enter Doctor ID:');
    if (doctorId) {
      setSelectedDoctor(doctorId);
      setSelectedPatient(patientId);
      setShowCalendar(true);
    }
  };

  if (loading) return <div className="p-4">Loading patients...</div>;
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchPatients}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showCalendar) {
    return (
      <Calendar 
        doctorId={selectedDoctor}
        patientId={selectedPatient}
        onNavigateBack={() => {
          setShowCalendar(false);
          setSelectedDoctor(null);
          setSelectedPatient(null);
        }}
        onError={(error) => {
          setError(error);
          setShowCalendar(false);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patients List</h1>
      {patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.doctorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.healthProblem}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectDoctor(patient.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Schedule Appointment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientTable;