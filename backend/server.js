import http from 'http';
import url from 'url';
import bcrypt from 'bcryptjs';  
import client from './db.js';   
import transporter from './mailConfiguration.js'; 
import { createDoctor, getAllDoctors, updateDoctor, deleteDoctor } from './doctorsCRUD.js';
import { createAssistant, getAllAssistants, updateAssistant, deleteAssistant } from './assistantsCRUD.js';
import { getAllPatients } from './getAllPatients.js';
import { createAppointment } from './Appointement.js';


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

    try {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;

        if (path === '/submit' && req.method === 'POST') {
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

                    const hashedPassword = await bcrypt.hash(formData.password, 10);

                    const query = `
                        INSERT INTO "Patients" (
                            "fullName", "cni", "email", "phoneNumber",
                            "healthProblem", "doctorName", "city", "age", "gender", "password", "createdAt", "updatedAt"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
                        RETURNING id
                    `;
                    const values = [
                        formData.fullName, formData.cni, formData.email, formData.phoneNumber,
                        formData.healthProblem, formData.doctorName, formData.city,
                        formData.age, formData.gender, hashedPassword
                    ];
                    const result = await client.query(query, values);

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: formData.email,
                        subject: `Welcome ${formData.fullName}`,
                        text: `Hi ${formData.fullName},\n\nThank you for registering with us. We're glad to have you!`
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) logError('Email Sending', err);
                        else console.log('Email sent:', info.response);
                    });

                    sendSuccessResponse(res, 200, { 
                        message: 'Patient successfully registered!', 
                        id: result.rows[0].id 
                    });
                } catch (error) {
                    logError('Patient Registration', error);
                    sendErrorResponse(res, 400, `Invalid request: ${error.message}`);
                }
            });
        } else if (path === '/login' && req.method === 'POST') {
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

                    sendSuccessResponse(res, 200, { 
                        message: 'Login successful', 
                        userId: user.id 
                    });
                } catch (error) {
                    logError('Login', error);
                    sendErrorResponse(res, 500, 'Server error during login');
                }
            });
        } else if (path === '/doctors' && req.method === 'GET') {
            try {
                const result = await client.query('SELECT id, name FROM "Doctors"');
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Doctors', error);
                sendErrorResponse(res, 500, 'Failed to fetch doctors');
            }
        } else if (path === '/diseases' && req.method === 'GET') {
            try {
                const result = await client.query('SELECT id, name FROM "Diseases"');
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Diseases', error);
                sendErrorResponse(res, 500, 'Failed to fetch diseases');
            }
        } else if (path === '/doctor') {
            if (req.method === 'GET') await getAllDoctors(req, res);
            else if (req.method === 'POST') await createDoctor(req, res);
        } else if (path.startsWith('/doctor/')) {
            const doctorId = path.split('/')[2];
            req.params = { doctorId };
            if (req.method === 'PUT') await updateDoctor(req, res);
            else if (req.method === 'DELETE') await deleteDoctor(req, res);
        } else if (path === '/assistant') {
            if (req.method === 'GET') await getAllAssistants(req, res);
            else if (req.method === 'POST') await createAssistant(req, res);
        } else if (path.match(/^\/assistant\/\d+$/)) {
            const assistantId = path.split('/')[2];
            req.params = { assistantId };
            if (req.method === 'PUT') await updateAssistant(req, res);
            else if (req.method === 'DELETE') await deleteAssistant(req, res);
        } else if (path.startsWith('/patient/') && req.method === 'GET') {
            try {
                const patientId = path.split('/')[2];
                const query = `
                    SELECT "fullName", "cni", "email", "phoneNumber", 
                           "healthProblem", "doctorName", "city", "age", "gender", "createdAt" 
                    FROM "Patients" WHERE id = $1
                `;
                const result = await client.query(query, [patientId]);
                
                if (result.rows.length === 0) {
                    sendErrorResponse(res, 404, 'Patient not found');
                    return;
                }
        
                sendSuccessResponse(res, 200, result.rows[0]);
            } catch (error) {
                logError('Fetching Patient', error);
                sendErrorResponse(res, 500, 'Failed to fetch patient data');
            }
        } else if (path === '/patients' && req.method === 'GET') {
            try {
                const result = await getAllPatients(req, res);
            } catch (error) {
                logError('Fetching Patients', error);
                sendErrorResponse(res, 500, 'Failed to fetch patients');
            }
        } else if (path === '/appointments' && req.method === 'POST') {
            try {
                await createAppointment(req, res);
            } catch (error) {
                logError('Appointment Handler', error);
                sendErrorResponse(res, 500, error.message || 'Failed to create appointment');
            }
        } else if (path === '/appointments/count' && req.method === 'GET') {
            try {
                const { doctorId, startDate, endDate } = parsedUrl.query;
                const query = `
                    SELECT DATE("appointmentDate") as date, COUNT(*) as count
                    FROM "Appointments"
                    WHERE "doctorId" = $1
                    AND DATE("appointmentDate") >= $2
                    AND DATE("appointmentDate") <= $3
                    GROUP BY DATE("appointmentDate")
                `;
                const result = await client.query(query, [doctorId, startDate, endDate]);
        
                const counts = {};
                result.rows.forEach(row => {
                    counts[row.date.toISOString().split('T')[0]] = parseInt(row.count, 10);
                });
        
                sendSuccessResponse(res, 200, { data: counts });
            } catch (error) {
                logError('Fetching Appointment Counts', error);
                sendErrorResponse(res, 500, 'Failed to fetch appointment counts');
            }
        } else if (path === '/patients' && req.method === 'GET') {
            try {
                const result = await getAllPatients(req, res);
                sendSuccessResponse(res, 200, result); // Ensure response is sent back
            } catch (error) {
                logError('Fetching Patients', error);
                sendErrorResponse(res, 500, 'Failed to fetch patients');
            }
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