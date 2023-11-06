export const formatName = (value: string | undefined) => {
    if (value === undefined || value === null) { return ''; }
    const cleanedValue = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    if (cleanedValue.length === 0) { return ''; }
    return cleanedValue;
};

export const formatPhone = (value: string | undefined) => {
    if (value === undefined || value === null) { return ''; }
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length === 0) { return ''; }
    return cleanedValue;
};

export const validateName = (name: string | undefined) => {
    if (name === undefined || name === null) { return false; }
    return name.length >= 2 && name.length <= 50 ? true : false;
};

export const validatePhone = (phone: string | undefined) => {
    if (phone === undefined || phone === null) { return false; }
    return phone.length >= 10 && phone.length <= 11 ? true : false;
};

export const validateEmail = (email: string | undefined) => {
    if (email === undefined || email === null) { return false; };
    if (email.length < 2 || email.length > 75) { return false; };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
