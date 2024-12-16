import http from 'http';
import url from 'url';
import bcrypt from 'bcryptjs';  
import client from './db.js';   
import transporter from './mailConfiguration.js'; 
import { createDoctor, getAllDoctors, updateDoctor, deleteDoctor } from './doctorsCRUD.js';


const PORT = process.env.PORT || 8080;

export const sendSuccessResponse = (res, statusCode, data) => {
    console.log('Sending success response:', { statusCode, data });
    if (!res.headersSent) {
        res.writeHead(statusCode, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000' 
        });
        res.end(JSON.stringify(data));
    }
};

export const sendErrorResponse = (res, statusCode, message) => {
    console.log('Sending error response:', { statusCode, message });
    if (!res.headersSent) {
        res.writeHead(statusCode, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000' 
        });
        res.end(JSON.stringify({ message }));
    }
};

const server = http.createServer(async (req, res) => {
    const logError = (stage, error) => {
        console.error(`[Error - ${stage}]`, {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            details: error.detail || 'No additional details',
            route: req.url,
            method: req.method
        });
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');


    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parseUrl = url.parse(req.url, true);

    try {
        if (req.method === 'POST' && parseUrl.pathname === '/submit') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });

            req.on('end', async () => {
                try {
                    const formData = JSON.parse(body);
                    const requiredFields = [
                        'fullName', 'cni', 'email', 'phoneNumber', 'healthProblem', 
                        'doctorName', 'city', 'age', 'gender', 'password'
                    ];
                    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

                    if (missingFields.length > 0) {
                        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                    }

                    const { fullName, cni, email, phoneNumber, healthProblem, doctorName, city, age, gender, password } = formData;
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const query = `
                        INSERT INTO "Patients" (
                            "fullName", "cni", "email", "phoneNumber",
                            "healthProblem", "doctorName", "city", "age", "gender", "password", "createdAt", "updatedAt"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
                        RETURNING id
                    `;
                    const values = [fullName, cni, email, phoneNumber, healthProblem, doctorName, city, age, gender, hashedPassword];
                    const result = await client.query(query, values);

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: `Welcome ${fullName}`,
                        text: `Hi ${fullName},\n\nThank you for registering with us. We're glad to have you!`
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) logError('Email Sending', err);
                        else console.log('Email sent:', info.response);
                    });

                    sendSuccessResponse(res, 200, { message: 'Patient successfully registered!', id: result.rows[0].id });
                } catch (error) {
                    logError('Patient Registration', error);
                    sendErrorResponse(res, 400, `Invalid request: ${error.message}`);
                }
            });
        } else if (req.method === 'POST' && parseUrl.pathname === '/login') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });

            req.on('end', async () => {
                try {
                    const { email, password } = JSON.parse(body);

                    if (!email || !password) {
                        sendErrorResponse(res, 400, 'Email and password are required');
                        return;
                    }

                    const query = 'SELECT * FROM "Patients" WHERE "email" = $1';
                    const result = await client.query(query, [email]);

                    if (result.rows.length === 0) {
                        sendErrorResponse(res, 401, 'Invalid credentials');
                        return;
                    }

                    const user = result.rows[0];
                    const isMatch = await bcrypt.compare(password, user.password);

                    if (!isMatch) {
                        sendErrorResponse(res, 401, 'Invalid credentials');
                        return;
                    }


                    sendSuccessResponse(res, 200, { message: 'Login successful', userId: user.id });
                } catch (error) {
                    logError('Login', error);
                    sendErrorResponse(res, 500, 'Server error during login');
                }
            });
        } else if (req.method === 'GET' && parseUrl.pathname === '/doctors') {
            try {
                const query = 'SELECT id, name FROM "Doctors"';
                const result = await client.query(query);
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Doctors', error);
                sendErrorResponse(res, 500, 'Failed to fetch doctors');
            }
        } else if (req.method === 'GET' && parseUrl.pathname === '/diseases') {
            try {
                const query = 'SELECT id, name FROM "Diseases"';
                const result = await client.query(query);
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Diseases', error);
                sendErrorResponse(res, 500, 'Failed to fetch diseases');
            }
        }try {
            const method = req.method; 
            const path = url.parse(req.url, true).pathname; 
        
            if (method === 'GET' && path === '/doctor') {
                // Get all doctors
                await getAllDoctors(req, res);
            } else if (method === 'POST' && path === '/doctor') {
                // Create doctor
                await createDoctor(req, res);
            } else if (method === 'PUT' && path.startsWith('/doctor/')) {
                
                const doctorId = path.split('/')[2];
                req.params = { doctorId };
                await updateDoctor(req, res);
            } else if (method === 'DELETE' && path.startsWith('/doctor/')) {
                const doctorId = path.split('/')[2];
                req.params = { doctorId };
                await deleteDoctor(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Route not found' }));
            }
        } catch (error) {
            console.error('Unhandled Error:', error);
            sendErrorResponse(res, 500, 'Internal Server Error');
        }
    } catch (error) {
        logError('General Server Error', error);
        sendErrorResponse(res, 500, 'Server encountered an error');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



export default { sendSuccessResponse, sendErrorResponse };
