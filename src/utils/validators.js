export const isEmailValid = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isPasswordStrong = (password) => {
  return password.length >= 6;
};
export const isPhoneNumberValid = (phone) => {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone);
};
export const isNonEmptyString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
};
export const isDateValid = (dateStr) => {
    return !isNaN(Date.parse(dateStr));
};
export const isTimeValid = (timeStr) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeStr);
};
export const isPositiveInteger = (num) => {
    return Number.isInteger(num) && num > 0;
};
export const isNonNegativeNumber = (num) => {
    return typeof num === 'number' && num >= 0;
};
export const isURLValid = (url) => {
    try {
        new URL(url); 
        return true;
    } catch (_) {
        return false;
    }
};
export const isZipCodeValid = (zip) => {
    const regex = /^\d{5}(-\d{4})?$/;
    return regex.test(zip);
};
export const isAlphabetic = (str) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(str);
};
export const isAlphanumeric = (str) => {
    const regex = /^[A-Za-z0-9\s]+$/;
    return regex.test(str);
}; 
export const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};
export const isValidCreditCard = (cardNumber) => {
    const regex = /^\d{13,19}$/;
    return regex.test(cardNumber.replace(/\s+/g, ''));
};
export const isValidCVV = (cvv) => {
    const regex = /^\d{3,4}$/;
    return regex.test(cvv);
};
export const isValidExpirationDate = (expDate) => {
    const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!regex.test(expDate)) return false;
    const [month, year] = expDate.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    return (year > currentYear) || (year === currentYear && month >= currentMonth);
};
export const isValidSocialSecurityNumber = (ssn) => {
    const regex = /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
    return regex.test(ssn);
};
export const isValidIPAddress = (ip) => {
    const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return regex.test(ip);
};