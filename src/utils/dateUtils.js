import moment from 'moment';

export const formatDate = (dateString) => moment(dateString).format('YYYY-MM-DD');

export const formatDisplayDate = (dateString) => moment(dateString).format('MMMM Do, YYYY');

export const isDateInPast = (dateString) => moment(dateString).isBefore(moment());
