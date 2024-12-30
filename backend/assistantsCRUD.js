import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';


export const createAssistant = async (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    
    req.on('end', async () => {
        try {
            const { name, password } = JSON.parse(body);
            console.log('Received request to create assistant:', { name, password }); 
            
            if (!name || !password) {
                return sendErrorResponse(res, 400, 'Both fields (name, password) are required');
            }
            
            const query = `
                INSERT INTO "Assistants" ("name", "password", "createdAt", "updatedAt")
                VALUES ($1, $2, NOW(), NOW()) 
                RETURNING *`; 
            
            const values = [name, password];
            const result = await client.query(query, values);
            console.log('Created assistant:', result.rows[0]); 
            
            sendSuccessResponse(res, 201, result.rows[0]);
        } catch (error) {
            console.error('Detailed error creating assistant:', error);
            sendErrorResponse(res, 500, `Error creating assistant: ${error.message}`);
        }
    });
};





export const getAllAssistants = async (req, res) => {
    try {
        console.log('Fetching all assistants'); 
        const query = 'SELECT id, name, password FROM "Assistants"';
        const result = await client.query(query);
        console.log('Found assistants:', result.rows); 
        sendSuccessResponse(res, 200, result.rows);
    } catch (error) {
        console.error('Error fetching assistants:', error);
        sendErrorResponse(res, 500, 'Error fetching assistants');
    }
};


export const updateAssistant = async (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const { name, password } = JSON.parse(body); 
            const assistantId = req.params.assistantId;

            const query = `
                UPDATE "Assistants"
                SET "name" = $1, "password" = $2, "updatedAt" = NOW()
                WHERE "id" = $3
                RETURNING *
            `;
            const values = [name, password, assistantId];
            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                return sendErrorResponse(res, 404, 'Assistant not found');
            }

            sendSuccessResponse(res, 200, result.rows[0]);
        } catch (error) {
            console.error('Error updating assistant:', error);
            sendErrorResponse(res, 500, 'Internal Server Error');
        }
    });
};


export const deleteAssistant = async (req, res) => {
    const assistantId = req.params.assistantId;

    try {
        const result = await client.query('DELETE FROM "Assistants" WHERE "id" = $1 RETURNING *', [assistantId]);

        if (result.rows.length === 0) {
            return sendErrorResponse(res, 404, 'Assistant not found');
        }

        sendSuccessResponse(res, 200, { message: 'Assistant deleted successfully' });
    } catch (error) {
        console.error('Error deleting Assistant:', error);
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
};




export default {deleteAssistant, updateAssistant, createAssistant, getAllAssistants};