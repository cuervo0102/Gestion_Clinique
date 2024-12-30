import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

const Calendar = ({ doctorId, patientId, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, doctorId]);

  const fetchAppointments = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const response = await fetch(
        `http://localhost:8080/appointments/count?` +
        `doctorId=${doctorId}&` +
        `startDate=${format(start, 'yyyy-MM-dd')}&` +
        `endDate=${format(end, 'yyyy-MM-dd')}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const { data } = await response.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      if ((appointments[dateStr] || 0) >= 10) {
        throw new Error('This date is fully booked');
      }

      const response = await fetch('http://localhost:8080/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentDate: dateStr
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Booking failed');
      }

      await fetchAppointments();
      alert('Appointment booked successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const weeks = days.reduce((weeks, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    weeks[weekIndex] = weeks[weekIndex] || [];
    weeks[weekIndex].push(day);
    return weeks;
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          ←
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          →
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="p-2 bg-gray-50 border-b text-gray-600">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="h-96 text-center">
                  Loading calendar...
                </td>
              </tr>
            ) : (
              weeks.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const count = appointments[dateStr] || 0;
                    const isFull = count >= 10;
                    
                    return (
                      <td 
                        key={dayIndex}
                        className={`p-4 border ${
                          !isSameMonth(day, currentDate) ? 'bg-gray-50' :
                          isFull ? 'bg-red-50' : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{format(day, 'd')}</div>
                          <div className="text-sm text-gray-500">{count}/10</div>
                          {!isFull && isSameMonth(day, currentDate) && (
                            <button
                              onClick={() => handleBooking(day)}
                              className="w-full px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Book
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Calendar;