import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';

// Handler for fetching all patients
export const getAllPatients = async (req, res) => {
    try {
        console.log('Fetching all Patients'); 
        const query = 'SELECT id, "fullName", "doctorName", "healthProblem" FROM "Patients"';
        const result = await client.query(query);
        console.log('Found Patients:', result.rows); 
        sendSuccessResponse(res, 200, result.rows);
    } catch (error) {
        console.error('Error fetching Patients:', error);
        sendErrorResponse(res, 500, 'Error fetching Patients');
    }
};

export const getPatientById = async (req, res) => {
    const patientId = req.params.patientId; 
    try {
        console.log(`Fetching Patient with ID: ${patientId}`);
        
        const query = 'SELECT * FROM "Patients" WHERE id = $1';
        const result = await client.query(query, [patientId]);
        
        if (result.rows.length === 0) {
            return sendErrorResponse(res, 404, 'Patient not found');
        }
        
        console.log('Found Patient:', result.rows[0]);
        sendSuccessResponse(res, 200, result.rows[0]);
    } catch (error) {
        console.error('Error fetching Patient by ID:', error);
        sendErrorResponse(res, 500, 'Error fetching Patient data');
    }
};

export default { getAllPatients, getPatientById };
