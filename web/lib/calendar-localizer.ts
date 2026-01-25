import { dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';

const locales = { 'en-US': enUS };

export const calendarLocalizer = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales,
});
