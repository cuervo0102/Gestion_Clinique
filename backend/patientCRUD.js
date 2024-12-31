import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';
import transporter from './mailConfiguration.js';
import bcrypt from 'bcryptjs';  

const logError = (stage, error) => {
    console.error(`[Error - ${stage}]`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        details: error.detail || 'No additional details'
    });
};

export const createPatient = async (req, res) => {
    try {
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
    } catch (error) {
        logError('Patient Creation', error);
        sendErrorResponse(res, 500, 'Failed to create patient');
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patientId = req.params.id;
        const query = `
            SELECT "fullName", "cni", "email", "phoneNumber", 
                   "healthProblem", "doctorName", "city", "age", "gender", "createdAt" 
            FROM "Patients" 
            WHERE id = $1
        `;
        const result = await client.query(query, [patientId]);
        
        if (result.rows.length === 0) {
            return sendErrorResponse(res, 404, 'Patient not found');
        }

        sendSuccessResponse(res, 200, result.rows[0]);
    } catch (error) {
        logError('Fetching Patient', error);
        sendErrorResponse(res, 500, 'Failed to fetch patient data');
    }
};

export const loginPatient = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const { email, password } = JSON.parse(body);

                if (!email || !password) {
                    return sendErrorResponse(res, 400, 'Email and password are required');
                }

                const query = 'SELECT * FROM "Patients" WHERE "email" = $1';
                const result = await client.query(query, [email]);

                if (result.rows.length === 0) {
                    return sendErrorResponse(res, 401, 'Invalid credentials');
                }

                const user = result.rows[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return sendErrorResponse(res, 401, 'Invalid credentials');
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
    } catch (error) {
        logError('Login Process', error);
        sendErrorResponse(res, 500, 'Failed to process login');
    }
};

export default { createPatient, getPatientById, loginPatient };