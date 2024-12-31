import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import '../patient-create.css';


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

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsResponse, diseasesResponse] = await Promise.all([
          fetch('http://localhost:8080/doctors'),
          fetch('http://localhost:8080/diseases'),
        ]);

        const doctorsData = await doctorsResponse.json();
        const diseasesData = await diseasesResponse.json();

        setDoctors(doctorsData.data || doctorsData);
        setDiseases(diseasesData.data || diseasesData);
      } catch (err) {
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
      setSubmitStatus({
        loading: false,
        error: 'Network error or server unavailable',
        success: false,
      });
      alert('Network error or server unavailable');
    }
  };

  return (
    <div className="container my-5">
      <div className="create-patient-container bg-light p-5 rounded shadow">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center mb-4 text-pink">Create an appointement</h1>

          <div className="form-group mb-3">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={patientData.fullName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>CNI</label>
            <input
              type="text"
              name="cni"
              value={patientData.cni}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={patientData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={patientData.phoneNumber}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Health Problem</label>
            <select
              name="healthProblem"
              value={patientData.healthProblem}
              onChange={handleChange}
              className="form-control"
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

          <div className="form-group mb-3">
            <label>Doctor Name</label>
            <select
              name="doctorName"
              value={patientData.doctorName}
              onChange={handleChange}
              className="form-control"
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

          <div className="form-group mb-3">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={patientData.city}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={patientData.age}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Gender</label>
            <select
              name="gender"
              value={patientData.gender}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group mb-3 position-relative">
            <label>Password</label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              value={patientData.password}
              onChange={handleChange}
              className="form-control"
              required
            />
            <span
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="position-absolute"
              style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitStatus.loading}
            className="btn btn-pink w-100 py-2"
          >
            {submitStatus.loading ? 'Submitting...' : 'Create Patient'}
          </button>

          {submitStatus.success && (
            <div className="alert alert-success mt-3">Patient created successfully!</div>
          )}
          {submitStatus.error && (
            <div className="alert alert-danger mt-3">{submitStatus.error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePatient;
