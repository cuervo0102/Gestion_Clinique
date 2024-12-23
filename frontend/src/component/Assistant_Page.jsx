import React, { useState, useEffect } from 'react';

const AssistantPage = () => {
    const [assistants, setAssistants] = useState([]);
    const [newAssistant, setNewAssistant] = useState({
        name: '',
        password: '',
    });
    const [editingAssistant, setEditingAssistant] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAssistants = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/assistant');
            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data); // Debug log
            
            if (Array.isArray(data)) {
                setAssistants(data);
            } else {
                console.error('Unexpected data structure:', data);
                setError('Invalid data format received');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssistants();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingAssistant) {
            setEditingAssistant({ ...editingAssistant, [name]: value });
        } else {
            setNewAssistant({ ...newAssistant, [name]: value });
        }
    };

    const handleCreateAssistant = async () => {
        try {
            if (!newAssistant.name || !newAssistant.password) {
                setError('Name and password are required');
                return;
            }
    
            const response = await fetch('http://localhost:8080/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAssistant),
            });
    
            if (!response.ok) {
                throw new Error('Error creating assistant');
            }
    
            const result = await response.json();
    
            // Explicitly re-fetch the list of assistants
            fetchAssistants();
    
            setNewAssistant({ name: '', password: '' });
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };
    

    const handleUpdateAssistant = async () => {
        try {
            const response = await fetch(`http://localhost:8080/assistant/${editingAssistant.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAssistant),
            });

            if (!response.ok) {
                throw new Error('Error updating assistant');
            }

            const updatedAssistant = await response.json();
            setAssistants((prevAssistants) =>
                prevAssistants.map((assistant) =>
                    assistant.id === updatedAssistant.id ? updatedAssistant : assistant
                )
            );
            setEditingAssistant(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteAssistant = async (assistantId) => {
        try {
            const response = await fetch(`http://localhost:8080/assistant/${assistantId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error deleting assistant');
            }

            setAssistants((prevAssistants) =>
                prevAssistants.filter((assistant) => assistant.id !== assistantId)
            );
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="assistants-page">
            <h1>Assistants List</h1>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            {loading ? (
                <p>Loading assistants...</p>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Password</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assistants && assistants.length > 0 ? (
                                assistants.map((assistant) => (
                                    <tr key={assistant.id}>
                                        <td>{assistant.name}</td>
                                        <td>{assistant.password}</td>
                                        <td>
                                            <button onClick={() => setEditingAssistant(assistant)}>Edit</button>
                                            <button onClick={() => handleDeleteAssistant(assistant.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No assistants available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <h2>{editingAssistant ? 'Edit Assistant' : 'Create Assistant'}</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            editingAssistant ? handleUpdateAssistant() : handleCreateAssistant();
                        }}
                    >
                        <div>
                            <label>Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={editingAssistant ? editingAssistant.name : newAssistant.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={editingAssistant ? editingAssistant.password : newAssistant.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit">{editingAssistant ? 'Update' : 'Create'}</button>
                        {editingAssistant && (
                            <button type="button" onClick={() => setEditingAssistant(null)}>
                                Cancel
                            </button>
                        )}
                    </form>
                </>
            )}
        </div>
    );
};

export default AssistantPage;
