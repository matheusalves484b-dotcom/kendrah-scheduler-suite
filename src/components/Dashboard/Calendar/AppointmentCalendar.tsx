import { useState, useCallback, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '@/types';
import AppointmentModal from './AppointmentModal';

// Calendário sempre apresentado no padrão brasileiro.
// O react-big-calendar usa o fuso horário local do navegador para os objetos Date,
// portanto no Brasil os horários são exibidos no horário local (UTC-3).
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Lista',
  date: 'Data',
  time: 'Horário',
  event: 'Agendamento',
  noEventsInRange: 'Nenhum agendamento neste período.',
  showMore: (total: number) => `+${total} agendamento${total === 1 ? '' : 's'}`,
};

const formats = {
  // Formato brasileiro de data e horário.
  dateFormat: 'DD/MM/YYYY',
  dayFormat: 'ddd DD',
  weekdayFormat: 'ddd',
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('HH:mm')} – ${moment(end).format('HH:mm')}`,
  agendaTimeFormat: 'HH:mm',
  agendaDateFormat: 'ddd, DD/MM',
  monthHeaderFormat: 'MMMM [de] YYYY',
  dayHeaderFormat: 'dddd, DD [de] MMMM [de] YYYY',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${moment(start).format('DD/MM')} – ${moment(end).format('DD/MM/YYYY')}`,
};

interface AppointmentCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const AppointmentCalendar = ({ events, onEventClick }: AppointmentCalendarProps) => {
  const isMobile = useIsMobile();
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setView(isMobile ? Views.DAY : Views.WEEK);
  }, [isMobile]);

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      onEventClick?.(event);
    },
    [onEventClick]
  );

  const closeModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const eventStyleGetter = useCallback(() => {
    return {
      className: 'bg-kendrah-purple',
      style: {
        borderRadius: '7px',
        opacity: 1,
        color: 'white',
        border: '0',
        fontSize: '0.84rem',
        fontWeight: 500,
        padding: '3px 7px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      },
    };
  }, []);

  // Mantém a grade focada no horário comercial e evita uma coluna enorme de horários vazios.
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(23, 0, 0, 0);

  return (
    <div className="calendar-container rounded-xl border border-kendrah-gray/40 bg-white shadow-sm h-[560px] sm:h-[650px] lg:h-[720px] flex flex-col overflow-hidden">
      <Calendar
        localizer={localizer}
        culture="pt-br"
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', minWidth: isMobile ? '320px' : undefined }}
        views={isMobile ? [Views.DAY, Views.WEEK] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.WEEK}
        onView={setView}
        view={view}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) => event.title}
        popup
        messages={messages}
        formats={formats}
        min={minTime}
        max={maxTime}
        step={30}
        timeslots={2}
        showMultiDayTimes
        selectable={false}
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
