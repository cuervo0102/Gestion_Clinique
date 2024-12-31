import http from 'http';
import url from 'url';
import { createDoctor, getAllDoctors, updateDoctor, deleteDoctor } from './doctorsCRUD.js';
import { createAssistant, getAllAssistants, updateAssistant, deleteAssistant } from './assistantsCRUD.js';
import { getAllPatients } from './getAllPatients.js';
import { createAppointment, getAppointmentCounts } from './Appointement.js';
import { createPatient, getPatientById, loginPatient } from './patientCRUD.js';
import { loginAdmin } from './admin.js';
import client from './db.js';

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

    // Set CORS headers
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

        // Patient Routes
        if (path === '/submit' && req.method === 'POST') {
            await createPatient(req, res);
        } else if (path === '/login' && req.method === 'POST') {
            await loginPatient(req, res);
        } else if (path.startsWith('/patient/') && req.method === 'GET') {
            req.params = { id: path.split('/')[2] };
            await getPatientById(req, res);
        } else if (path === '/patients' && req.method === 'GET') {
            try {
                const result = await getAllPatients(req, res);
                sendSuccessResponse(res, 200, result);
            } catch (error) {
                logError('Fetching Patients', error);
                sendErrorResponse(res, 500, 'Failed to fetch patients');
            }
        }

        // Doctor Routes
        else if (path === '/doctors' && req.method === 'GET') {
            try {
                const result = await client.query('SELECT id, name FROM "Doctors"');
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Doctors', error);
                sendErrorResponse(res, 500, 'Failed to fetch doctors');
            }
        } else if (path === '/doctor') {
            if (req.method === 'GET') await getAllDoctors(req, res);
            else if (req.method === 'POST') await createDoctor(req, res);
        } else if (path.startsWith('/doctor/')) {
            const doctorId = path.split('/')[2];
            req.params = { doctorId };
            if (req.method === 'PUT') await updateDoctor(req, res);
            else if (req.method === 'DELETE') await deleteDoctor(req, res);
        }

        // Assistant Routes
        else if (path === '/assistant') {
            if (req.method === 'GET') await getAllAssistants(req, res);
            else if (req.method === 'POST') await createAssistant(req, res);
        } else if (path.match(/^\/assistant\/\d+$/)) {
            const assistantId = path.split('/')[2];
            req.params = { assistantId };
            if (req.method === 'PUT') await updateAssistant(req, res);
            else if (req.method === 'DELETE') await deleteAssistant(req, res);
        }

        // Disease Routes
        else if (path === '/diseases' && req.method === 'GET') {
            try {
                const result = await client.query('SELECT id, name FROM "Diseases"');
                sendSuccessResponse(res, 200, result.rows);
            } catch (error) {
                logError('Fetching Diseases', error);
                sendErrorResponse(res, 500, 'Failed to fetch diseases');
            }
        }

        // Appointment Routes
        else if (path === '/appointments' && req.method === 'POST') {
            try {
                await createAppointment(req, res);
            } catch (error) {
                logError('Appointment Creation', error);
                sendErrorResponse(res, 500, 'Failed to create appointment');
            }
        }else if (path === '/appointments/count' && req.method === 'GET') {
            await getAppointmentCounts(req, res);
        }
        else if (path === '/admin' && req.method === 'POST') {
            await loginAdmin(req, res);
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