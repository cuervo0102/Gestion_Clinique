// Appointement.js
import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';

export const createAppointment = async (req, res) => {
    try {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { patientId, doctorId, appointmentDate } = data;
                
                if (!patientId || !doctorId || !appointmentDate) {
                    return sendErrorResponse(res, 400, 'Patient ID, Doctor ID, and Appointment Date are required');
                }
                
                const parsedDate = new Date(appointmentDate);
                if (isNaN(parsedDate)) {
                    return sendErrorResponse(res, 400, 'Invalid appointment date format');
                }
                
                const existingAppointmentQuery = `
                    SELECT COUNT(*) AS count 
                    FROM "Appointments" 
                    WHERE "patientId" = $1 
                    AND DATE("appointmentDate") = $2
                `;
                const existingResult = await client.query(existingAppointmentQuery, [patientId, appointmentDate]);
                
                if (parseInt(existingResult.rows[0].count) > 0) {
                    return sendErrorResponse(res, 400, 'You already have an appointment on this date');
                }
                
                const checkQuery = `
                    SELECT COUNT(*) AS count 
                    FROM "Appointments" 
                    WHERE "doctorId" = $1 
                    AND DATE("appointmentDate") = $2
                `;
                const checkValues = [doctorId, appointmentDate];
                const countResult = await client.query(checkQuery, checkValues);
                
                if (parseInt(countResult.rows[0].count) >= 10) {
                    return sendErrorResponse(res, 400, 'This doctor already has 10 appointments on this date');
                }
                
                const insertQuery = `
                    INSERT INTO "Appointments" 
                    ("patientId", "doctorId", "appointmentDate", "status", "createdAt", "updatedAt")
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    RETURNING *
                `;
                const insertValues = [patientId, doctorId, appointmentDate, 'Pending'];
                const result = await client.query(insertQuery, insertValues);
                
                sendSuccessResponse(res, 201, {
                    message: 'Appointment created successfully',
                    data: result.rows[0]
                });
            } catch (error) {
                console.error('Error creating appointment:', error);
                sendErrorResponse(res, 500, 'Failed to create appointment: ' + error.message);
            }
        });
    } catch (error) {
        console.error('Error in appointment creation:', error);
        sendErrorResponse(res, 500, 'Server error while creating appointment');
    }
};

export const getAppointmentCounts = async (req, res) => {
    try {
        const { doctorId, startDate, endDate } = req.query;
        
        if (!doctorId || !startDate || !endDate) {
            return sendErrorResponse(res, 400, 'Doctor ID, start date, and end date are required');
        }
        
        const query = `
            SELECT 
                DATE("appointmentDate") as date,
                COUNT(*) as count
            FROM "Appointments"
            WHERE "doctorId" = $1
            AND DATE("appointmentDate") >= DATE($2)
            AND DATE("appointmentDate") <= DATE($3)
            GROUP BY DATE("appointmentDate")
        `;
        
        const result = await client.query(query, [doctorId, startDate, endDate]);
        
        const counts = {};
        result.rows.forEach(row => {
            counts[row.date.toISOString().split('T')[0]] = parseInt(row.count);
        });
        
        sendSuccessResponse(res, 200, counts);
    } catch (error) {
        console.error('Error getting appointment counts:', error);
        sendErrorResponse(res, 500, 'Failed to get appointment counts');
    }
};

export default { createAppointment, getAppointmentCounts };