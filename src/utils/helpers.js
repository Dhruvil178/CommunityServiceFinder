import moment from 'moment';

export const formatDate = (dateStr) => moment(dateStr).format('MMMM DD, YYYY');

export const formatTime = (timeStr) => moment(timeStr, ['HH:mm', 'hh:mm A']).format('hh:mm A');
