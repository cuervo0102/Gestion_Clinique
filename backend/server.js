import http from 'http';
import url from 'url';
import path from 'path';
import bcrypt from 'bcrypt';
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

               
                const requiredFields = [
                    'fullName', 'cni', 'email', 'phoneNumber',
                    'healthProblem', 'doctorName', 'city',
                    'age', 'gender', 'password'
                ];

                const missingFields = requiredFields.filter(field => 
                    !formData[field] || formData[field].trim() === ''
                );

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                const { 
                    fullName, cni, email, phoneNumber,
                    healthProblem, doctorName, city,
                    age, gender, password
                } = formData;

                const createdAt = new Date();
                const updatedAt = new Date();

               
                const hashedPassword = await bcrypt.hash(password, 10);

                const query = `
                    INSERT INTO "Patients" (
                        "fullName", "cni", "email", "phoneNumber",
                        "healthProblem", "doctorName", "city",
                        "age", "gender", "password", "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                `;

                const values = [
                    fullName, cni, email, phoneNumber,
                    healthProblem, doctorName, city,
                    age, gender, hashedPassword,
                    createdAt, updatedAt
                ];

                try {
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

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Patient successfully registered!',
                        id: result.rows[0].id 
                    }));
                } catch (dbError) {
                    logError('Database Insertion', dbError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Error saving patient data',
                        error: dbError.message
                    }));
                }
            } catch (error) {
                logError('Request Handling', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Invalid request data',
                    error: error.message
                }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
