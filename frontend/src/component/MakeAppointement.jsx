import React, { useState, useEffect } from 'react';
import '../tooplate-style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Appointment = () => {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    message: '',
    isError: false,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setLoadingError('');

        const [doctorsResponse, diseasesResponse] = await Promise.all([
          fetch('http://localhost:8080/doctors'),
          fetch('http://localhost:8080/diseases'),
        ]);

        if (!doctorsResponse.ok || !diseasesResponse.ok) {
          throw new Error('Failed to fetch data from the server');
        }

        const doctorsData = await doctorsResponse.json();
        const diseasesData = await diseasesResponse.json();

        setDoctors(Array.isArray(doctorsData) ? doctorsData : doctorsData.data || []);
        setDiseases(Array.isArray(diseasesData) ? diseasesData : diseasesData.data || []);
        setLoadingData(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoadingError('Failed to load necessary data. Please try again later.');
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Full name is required';
      case 'cni':
        return /^[A-Za-z]{2}[0-9A-Za-z]+$/i.test(value)
          ? ''
          : 'CNI must start with 2 letters followed by alphanumeric characters';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'Please enter a valid email address';
      case 'phoneNumber':
        return /^[0-9]{8,10}$/.test(value)
          ? ''
          : 'Phone number must be 8-10 digits';
      case 'password':
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
          ? ''
          : 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character';
      case 'age':
        const ageNum = parseInt(value);
        return ageNum > 0 && ageNum < 150 ? '' : 'Please enter a valid age';
      case 'gender':
        return value ? '' : 'Please select a gender';
      case 'city':
        return value.trim() ? '' : 'City is required';
      case 'doctorName':
        return value ? '' : 'Please select a doctor';
      case 'healthProblem':
        return value ? '' : 'Please select a health problem';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, message: '', isError: false });

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus({
        loading: false,
        message: 'Please correct all errors before submitting',
        isError: true,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      setSubmitStatus({
        loading: false,
        message: 'Appointment created successfully!',
        isError: false,
      });

      setFormData({
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
      setErrors({});
    } catch (err) {
      setSubmitStatus({
        loading: false,
        message: err.message || 'An error occurred during submission',
        isError: true,
      });
    }
  };

  if (loadingData) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      <h1>Updated Form Container</h1>
    </div>
  );
};

export default Appointment;
