import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../calender.css'; 


const Calendar = ({ doctorId, patientId, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  const fetchAppointments = useCallback(async () => {
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
  }, [currentDate, doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
          appointmentDate: dateStr,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Booking failed');
      }

      await fetchAppointments();
      setShowBookingSuccess(true);
      setTimeout(() => setShowBookingSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMonthChange = (increment) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const weeks = days.reduce((weeks, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    weeks[weekIndex] = weeks[weekIndex] || [];
    weeks[weekIndex].push(day);
    return weeks;
  }, []);

  return (
    <div className="calendar-overlay d-flex align-items-center justify-content-center">
      <div className="calendar-container rounded shadow p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="btn btn-outline-pink"
          >
            ←
          </button>
          <h2 className="text-pink fw-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <button
            onClick={() => handleMonthChange(1)}
            className="btn btn-outline-pink"
          >
            →
          </button>
        </div>

        
        {error && <div className="alert alert-danger">{error}</div>}

        {showBookingSuccess && (
          <div className="alert alert-success">Appointment booked successfully!</div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-pink text-center">
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    <div className="spinner-border text-pink" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const count = appointments[dateStr] || 0;
                      const isFull = count >= 10;
                      const isCurrentDay = isToday(day);

                      return (
                        <td
                          key={dayIndex}
                          className={`calendar-cell ${
                            !isSameMonth(day, currentDate)
                              ? 'bg-light'
                              : isFull
                              ? 'bg-danger text-white'
                              : 'bg-white'
                          } ${
                            isCurrentDay ? 'border border-primary' : ''
                          }`}
                        >
                          <div className="text-center">
                            <div className="fw-bold">
                              {format(day, 'd')}
                            </div>
                            <div className="progress mt-2">
                              <div
                                className="progress-bar bg-pink"
                                role="progressbar"
                                style={{ width: `${(count / 10) * 100}%` }}
                                aria-valuenow={(count / 10) * 100}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <small>{count}/10 slots</small>
                            {!isFull && isSameMonth(day, currentDate) && (
                              <button
                                onClick={() => handleBooking(day)}
                                className="btn btn-sm btn-pink mt-2"
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

      
        <div className="text-end mt-4">
          <button onClick={onClose} className="btn btn-outline-pink">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
