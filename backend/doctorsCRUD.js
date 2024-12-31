import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';


export const createDoctor = async (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const { name, specialization, contactInfo } = JSON.parse(body);

            if (!name || !specialization || !contactInfo) {
                return sendErrorResponse(res, 400, 'All fields (name, specialization, contactInfo) are required');
            }

            const query = `
                INSERT INTO "Doctors" ("name", "specialization", "contactInfo", "createdAt", "updatedAt") 
                VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id
            `;
            const values = [name, specialization, contactInfo];
            const result = await client.query(query, values);

            sendSuccessResponse(res, 201, { message: 'Doctor created successfully', doctorId: result.rows[0].id });
        } catch (error) {
            console.error('Error creating doctor:', error);
            sendErrorResponse(res, 500, 'Internal Server Error');
        }
    });
};




export const getAllDoctors = async (req, res) => {
    try {
        const query = 'SELECT id, name, specialization, "contactInfo" FROM "Doctors"';
        const result = await client.query(query);

        sendSuccessResponse(res, 200, result.rows);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        sendErrorResponse(res, 500, 'Error fetching doctors');
    }
};


export const updateDoctor = async (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const updatedDoctor = JSON.parse(body); 
            const doctorId = req.params.doctorId;

            const query = `
                UPDATE "Doctors"
                SET "name" = $1, "specialization" = $2, "contactInfo" = $3, "updatedAt" = NOW()
                WHERE "id" = $4
                RETURNING *
            `;
            const values = [updatedDoctor.name, updatedDoctor.specialization, updatedDoctor.contactInfo, doctorId];
            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                return sendErrorResponse(res, 404, 'Doctor not found');
            }

            sendSuccessResponse(res, 200, result.rows[0]);
        } catch (error) {
            console.error('Error updating doctor:', error);
            sendErrorResponse(res, 500, 'Internal Server Error');
        }
    });
};




export const deleteDoctor = async (req, res) => {
    const doctorId = req.params.doctorId;

    try {
        const result = await client.query('DELETE FROM "Doctors" WHERE "id" = $1 RETURNING *', [doctorId]);

        if (result.rows.length === 0) {
            return sendErrorResponse(res, 404, 'Doctor not found');
        }

        sendSuccessResponse(res, 200, { message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};



export default {deleteDoctor, updateDoctor, createDoctor, getAllDoctors};