import client from './db.js';
import { sendSuccessResponse, sendErrorResponse } from './server.js';

export const createAppointment = async (req, res) => {
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

            const checkQuery = `
                SELECT COUNT(*) AS count 
                FROM "Appointments" 
                WHERE "doctorId" = $1 
                AND DATE("appointmentDate") = $2
            `;
            const checkValues = [doctorId, parsedDate.toISOString().split('T')[0]];
            const countResult = await client.query(checkQuery, checkValues);
            
            if (parseInt(countResult.rows[0].count, 10) >= 10) {
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

            return sendSuccessResponse(res, 201, {
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Error creating appointment:', error);
            return sendErrorResponse(res, 500, error.message);
        }
    });

    req.on('error', (error) => {
        console.error('Error reading request body:', error);
        return sendErrorResponse(res, 500, 'Error reading request body');
    });
};

// Add this to your backend API
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
        
        // Convert to object with dates as keys
        const counts = {};
        result.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            counts[dateStr] = parseInt(row.count);
        });

        return sendSuccessResponse(res, 200, counts);
    } catch (error) {
        console.error('Error getting appointment counts:', error);
        return sendErrorResponse(res, 500, error.message);
    }
};