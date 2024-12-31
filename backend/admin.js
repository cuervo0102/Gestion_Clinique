import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';



const logError = (stage, error) => {
    console.error(`[Error - ${stage}]`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        details: error.detail || 'No additional details'
    });
};



export const loginAdmin = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const { username, password } = JSON.parse(body);

                if (!email || !password) {
                    return sendErrorResponse(res, 400, 'Username and password are required');
                }

                const query = 'SELECT * FROM "Admins" WHERE "username" = $1';
                const result = await client.query(query, [username]);

                if (result.rows.length === 0) {
                    return sendErrorResponse(res, 401, 'Invalid credentials');
                }

                const user = result.rows[0];
                
                sendSuccessResponse(res, 200, { 
                    message: 'Login successful', 
                    userId: user.id 
                });
            } catch (error) {
                logError('Login', error);
                sendErrorResponse(res, 500, 'Server error during login');
            }
        });
    } catch (error) {
        logError('Login Process', error);
        sendErrorResponse(res, 500, 'Failed to process login');
    }
};

export default {  loginAdmin };