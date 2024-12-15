import http from 'http';
import url from 'url';
import bcrypt from 'bcryptjs';  
import client from './db.js';   
import transporter from './mailConfiguration.js'; 

const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
    const logError = (stage, error) => {
        console.error(`[Error - ${stage}]`, {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            details: error.detail || 'No additional details'
        });
    };

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

   
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parseUrl = url.parse(req.url, true);


    if (req.method === 'POST' && parseUrl.pathname === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const formData = JSON.parse(body);
                const requiredFields = ['fullName', 'cni', 'email', 'phoneNumber', 'healthProblem', 'doctorName', 'city', 'age', 'gender', 'password'];
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
                    if (err) {
                        logError('Email Sending', err);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });

                sendSuccessResponse(res, 200, { message: 'Patient successfully registered!', id: result.rows[0].id });
            } catch (error) {
                logError('Request Handling', error);
                sendErrorResponse(res, 400, `Invalid request data: ${error.message}`);
            }
        });
    }

    if (req.method === 'POST' && parseUrl.pathname === '/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                console.log('Received login request:', body);

                const { email, password } = JSON.parse(body);

                if (!email || !password) {
                    console.log('Missing email or password');
                    return sendErrorResponse(res, 400, 'Email and password are required.');
                }

                const query = `
                    SELECT "id", "password", "email" 
                    FROM "Patients" 
                    WHERE "email" = $1
                `;
                const values = [email];

                const result = await client.query(query, values);

                console.log('Database query result:', {
                    rowCount: result.rowCount,
                    rows: result.rows
                });

                if (result.rowCount === 0) {
                    console.log('User not found');
                    return sendErrorResponse(res, 401, 'Invalid credentials');
                }

                const storedPassword = result.rows[0].password;
                const isPasswordValid = await bcrypt.compare(password, storedPassword);

                console.log('Password validation details:', {
                    enteredPassword: password,
                    storedHashedPassword: storedPassword,
                    isPasswordValid: isPasswordValid
                });

                if (!isPasswordValid) {
                    console.log('Invalid credentials');
                    return sendErrorResponse(res, 401, 'Invalid credentials');
                }

                const userId = result.rows[0].id;

                console.log('Login successful, user ID:', userId);

                sendSuccessResponse(res, 200, { message: 'Login successful', userId });

            } catch (error) {
                console.error('Detailed login error:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                sendErrorResponse(res, 500, 'An unexpected error occurred');
            }
        });
    }


    const sendSuccessResponse = (res, statusCode, data) => {
        console.log('Sending success response:', { statusCode, data });
        if (!res.headersSent) {
            res.writeHead(statusCode, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000' 
            });
            res.end(JSON.stringify(data));
        }
    };

    const sendErrorResponse = (res, statusCode, message) => {
        console.log('Sending error response:', { statusCode, message });
        if (!res.headersSent) {
            res.writeHead(statusCode, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000' 
            });
            res.end(JSON.stringify({ message }));
        }
    };
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
