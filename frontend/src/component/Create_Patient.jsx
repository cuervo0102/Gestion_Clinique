import React, { useState } from 'react';

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

  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
     
      const response = await fetch('http://localhost:8080/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ loading: false, error: null, success: true });
        alert(`Patient created successfully! ID: ${data.id}`);
        
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
          error: data.message || 'Unknown error occurred', 
          success: false 
        });
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setSubmitStatus({ 
        loading: false, 
        error: 'Network error or server unavailable', 
        success: false 
      });
      alert('Network error or server unavailable');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Create Patient</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={patientData.fullName}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          CNI:
          <input
            type="text"
            name="cni"
            value={patientData.cni}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={patientData.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Phone Number:
          <input
            type="text"
            name="phoneNumber"
            value={patientData.phoneNumber}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Health Problem:
          <textarea
            name="healthProblem"
            value={patientData.healthProblem}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Doctor Name:
          <input
            type="text"
            name="doctorName"
            value={patientData.doctorName}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          City:
          <input
            type="text"
            name="city"
            value={patientData.city}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Age:
          <input
            type="number"
            name="age"
            value={patientData.age}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Gender:
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
        </label>
        <br />


        <label>
          Password:
          <input
            type="password"
            name="password"
            value={patientData.password}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        

        <button type="submit">Create Patient</button>
      </form>
    </div>
  );
};

export default CreatePatient;
