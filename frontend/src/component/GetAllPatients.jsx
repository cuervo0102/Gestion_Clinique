import React, { useState, useEffect } from 'react';
import Calendar from './calender';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading patients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            onClick={fetchPatients}
            className="btn btn-danger ms-3"
          >
            Retry
          </button>
        </div>
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
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-danger bg-opacity-25 py-4">
              <h2 className="card-title text-center text-danger mb-0">Patients List</h2>
            </div>
            <div className="card-body">
              {patients.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No patients found
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="text-uppercase text-secondary">Name</th>
                        <th className="text-uppercase text-secondary">Doctor</th>
                        <th className="text-uppercase text-secondary">Health Problem</th>
                        <th className="text-uppercase text-secondary">City</th>
                        <th className="text-uppercase text-secondary">Age</th>
                        <th className="text-uppercase text-secondary">Gender</th>
                        <th className="text-uppercase text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id}>
                          <td>{patient.fullName}</td>
                          <td>{patient.doctorName}</td>
                          <td>{patient.healthProblem}</td>
                          <td>{patient.city}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>
                            <button
                              onClick={() => handleSelectDoctor(patient.id)}
                              className="btn btn-danger btn-sm"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTable;