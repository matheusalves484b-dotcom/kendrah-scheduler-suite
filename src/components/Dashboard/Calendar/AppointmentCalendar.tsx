
import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/types';
import AppointmentModal from './AppointmentModal';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const AppointmentCalendar = ({ events }: AppointmentCalendarProps) => {
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const eventStyleGetter = useCallback(() => {
    return {
      className: 'bg-kendrah-purple',
      style: {
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        fontSize: '0.9em',
        padding: '1px 5px',
      }
    };
  }, []);

  return (
    <div className="calendar-container bg-white rounded-lg shadow border border-kendrah-gray/40 h-[700px] flex flex-col">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        defaultView={Views.WEEK}
        onView={setView}
        view={view}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) => `${event.title}`}
        popup
      />
      
      {selectedEvent && (
        <AppointmentModal
          appointment={selectedEvent.resource}
          isOpen={Boolean(selectedEvent)}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
