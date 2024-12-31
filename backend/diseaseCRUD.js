import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';

export const createDisease = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const { name, doctorId } = JSON.parse(body);

                if (!name || !doctorId) {
                    return sendErrorResponse(res, 400, 'Disease name and doctor ID are required');
                }

                const query = 'INSERT INTO "Diseases" (name, "doctorId") VALUES ($1, $2) RETURNING id, name, "doctorId"';
                const result = await client.query(query, [name, doctorId]);

                sendSuccessResponse(res, 201, result.rows[0]);
            } catch (error) {
                console.error('Error in disease creation:', error);
                sendErrorResponse(res, 500, 'Failed to create disease');
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        sendErrorResponse(res, 500, 'Server error while processing request');
    }
};

export const getAllDiseases = async (req, res) => {
    try {
        const query = `
            SELECT d.id, d.name, d."doctorId", doc.name as "doctorName"
            FROM "Diseases" d
            LEFT JOIN "Doctors" doc ON d."doctorId" = doc.id
            ORDER BY d.name ASC
        `;
        const result = await client.query(query);
        
        sendSuccessResponse(res, 200, result.rows);
    } catch (error) {
        console.error('Error fetching diseases:', error);
        sendErrorResponse(res, 500, 'Failed to fetch diseases');
    }
};

export const updateDisease = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const { name, doctorId } = JSON.parse(body);
                const diseaseId = req.params.diseaseId;

                if (!name || !doctorId) {
                    return sendErrorResponse(res, 400, 'Disease name and doctor ID are required');
                }

                const query = `
                    UPDATE "Diseases" 
                    SET name = $1, "doctorId" = $2 
                    WHERE id = $3 
                    RETURNING id, name, "doctorId"
                `;
                const result = await client.query(query, [name, doctorId, diseaseId]);

                if (result.rowCount === 0) {
                    return sendErrorResponse(res, 404, 'Disease not found');
                }

                sendSuccessResponse(res, 200, result.rows[0]);
            } catch (error) {
                console.error('Error in disease update:', error);
                sendErrorResponse(res, 500, 'Failed to update disease');
            }
        });
    } catch (error) {
        console.error('Error processing update request:', error);
        sendErrorResponse(res, 500, 'Server error while processing update');
    }
};

export const deleteDisease = async (req, res) => {
    try {
        const diseaseId = req.params.diseaseId;
        
        const query = 'DELETE FROM "Diseases" WHERE id = $1 RETURNING id';
        const result = await client.query(query, [diseaseId]);

        if (result.rowCount === 0) {
            return sendErrorResponse(res, 404, 'Disease not found');
        }

        sendSuccessResponse(res, 200, { message: 'Disease deleted successfully', id: diseaseId });
    } catch (error) {
        console.error('Error deleting disease:', error);
        sendErrorResponse(res, 500, 'Failed to delete disease');
    }
};

// Add these routes to your main server.js file:
export const addDiseaseRoutes = (server) => {
    server.on('request', async (req, res) => {
        const path = req.url;
        
        if (path === '/disease' && req.method === 'GET') {
            await getAllDiseases(req, res);
        } else if (path === '/disease' && req.method === 'POST') {
            await createDisease(req, res);
        } else if (path.match(/^\/disease\/\d+$/)) {
            const diseaseId = path.split('/')[2];
            req.params = { diseaseId };
            
            if (req.method === 'PUT') {
                await updateDisease(req, res);
            } else if (req.method === 'DELETE') {
                await deleteDisease(req, res);
            }
        }
    });
};

export default {
    createDisease,
    getAllDiseases,
    updateDisease,
    deleteDisease,
    addDiseaseRoutes
};