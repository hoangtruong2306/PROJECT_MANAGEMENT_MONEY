import API from './api';

export const sendForgot = (payload) => API.post('/auth/forgot', payload);

export default { sendForgot };
