import React, { useState, useEffect } from 'react';


const CreatePatient = () => {
  const [patientData, setPatientData] = useState({
    fullName: '',
    cni: '',
    email: '',
    phoneNumber: '',
    healthProblem: '',
    doctorName: '',
    city: '',
    age: '',
    gender: '',
    password: '',
  });

  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsResponse, diseasesResponse] = await Promise.all([
          fetch('http://localhost:8080/doctors'),
          fetch('http://localhost:8080/diseases'),
        ]);

        const doctorsData = await doctorsResponse.json();
        const diseasesData = await diseasesResponse.json();

        console.log('Doctors:', doctorsData);
        console.log('Diseases:', diseasesData);

        setDoctors(doctorsData.data || doctorsData);
        setDiseases(diseasesData.data || diseasesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert('Failed to load dropdown data.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      const response = await fetch('http://localhost:8080/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitStatus({ loading: false, error: null, success: true });
        alert(`Patient created successfully! ID: ${responseData.data.id}`);
        // Reset form
        setPatientData({
          fullName: '',
          cni: '',
          email: '',
          phoneNumber: '',
          healthProblem: '',
          doctorName: '',
          city: '',
          age: '',
          gender: '',
          password: '',
        });
      } else {
        setSubmitStatus({
          loading: false,
          error: responseData.message || 'Unknown error occurred',
          success: false,
        });
        alert(`Error: ${responseData.message}`);
      }
    } catch (err) {
      console.error('Submission Error:', err);
      setSubmitStatus({
        loading: false,
        error: 'Network error or server unavailable',
        success: false,
      });
      alert('Network error or server unavailable');
    }
  };

  return (
    <div className="create-patient-container">
      <form onSubmit={handleSubmit} className="patient-form">
        <h1>Create Patient</h1>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={patientData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>CNI</label>
          <input
            type="text"
            name="cni"
            value={patientData.cni}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={patientData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={patientData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Health Problem</label>
          <select
            name="healthProblem"
            value={patientData.healthProblem}
            onChange={handleChange}
            required
          >
            <option value="">Select Health Problem</option>
            {diseases.map((disease) => (
              <option key={disease.id} value={disease.id}>
                {disease.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Doctor Name</label>
          <select
            name="doctorName"
            value={patientData.doctorName}
            onChange={handleChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={patientData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={patientData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={patientData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={patientData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={submitStatus.loading} 
          className="submit-btn"
        >
          {submitStatus.loading ? 'Submitting...' : 'Create Patient'}
        </button>

        {submitStatus.success && (
          <div className="success-message">Patient created successfully!</div>
        )}
        {submitStatus.error && (
          <div className="error-message">{submitStatus.error}</div>
        )}
      </form>
    </div>
  );
};

export default CreatePatient;