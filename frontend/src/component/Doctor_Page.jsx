import React, { useState, useEffect } from 'react';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        specialization: '',
        contactInfo: ''
    });
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [error, setError] = useState(null);

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:8080/doctor');
            if (!response.ok) {
                throw new Error('Error fetching doctors');
            }
            const data = await response.json();
            setDoctors(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingDoctor) {
            setEditingDoctor({ ...editingDoctor, [name]: value });
        } else {
            setNewDoctor({ ...newDoctor, [name]: value });
        }
    };

    const handleCreateDoctor = async () => {
        try {
            if (!newDoctor.name || !newDoctor.specialization || !newDoctor.contactInfo) {
                setError('All fields are required');
                return;
            }

            const response = await fetch('http://localhost:8080/doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDoctor),
            });

            if (!response.ok) {
                throw new Error('Error creating doctor');
            }

            const data = await response.json();

            fetchDoctors(); 
            setNewDoctor({ name: '', specialization: '', contactInfo: '' }); 
            setError(null);
        } catch (error) {
            console.error('Error creating doctor:', error);
            setError(error.message);
        }
    };

    const handleUpdateDoctor = async () => {
        try {
            const response = await fetch(`http://localhost:8080/doctor/${editingDoctor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingDoctor), 
            });
    
            if (!response.ok) {
                throw new Error('Error updating doctor');
            }
    
            const updatedDoctor = await response.json();
            setDoctors((prevDoctors) =>
                prevDoctors.map((doctor) => (doctor.id === updatedDoctor.id ? updatedDoctor : doctor))
            );
            setEditingDoctor(null);
        } catch (error) {
            console.error('Error updating doctor:', error);
        }
    };
    
    const handleDeleteDoctor = async (doctorId) => {
        try {
            const response = await fetch(`http://localhost:8080/doctor/${doctorId}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error('Error deleting doctor');
            }
    
            setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== doctorId));
        } catch (error) {
            console.error('Error deleting doctor:', error);
        }
    };
    
   
    

    return (
        <div className="doctors-page">
            <h1>Doctors List</h1>
            
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Contact Info</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => (
                            <tr key={doctor.id}>
                                <td>{doctor.name}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.contactInfo}</td>
                                <td>
                                    <button onClick={() => setEditingDoctor(doctor)}>Edit</button>
                                    <button onClick={() => handleDeleteDoctor(doctor.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No doctors available</td></tr>
                    )}
                </tbody>
            </table>

            <h2>{editingDoctor ? 'Edit Doctor' : 'Create Doctor'}</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    editingDoctor ? handleUpdateDoctor() : handleCreateDoctor();
                }}
            >
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={editingDoctor ? editingDoctor.name : newDoctor.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Specialization:</label>
                    <input
                        type="text"
                        name="specialization"
                        value={editingDoctor ? editingDoctor.specialization : newDoctor.specialization}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Contact Info:</label>
                    <input
                        type="text"
                        name="contactInfo"
                        value={editingDoctor ? editingDoctor.contactInfo : newDoctor.contactInfo}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">{editingDoctor ? 'Update' : 'Create'}</button>
                {editingDoctor && (
                    <button type="button" onClick={() => setEditingDoctor(null)}>
                        Cancel
                    </button>
                )}
                
            </form>
        </div>
        
        
    );
};

export default DoctorsPage;
