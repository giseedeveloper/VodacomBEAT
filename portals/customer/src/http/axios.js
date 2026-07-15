import axios from 'axios';
import { getStoredUserToken } from "../state/auth/authStore";

const axiosClient = axios.create();


axiosClient.defaults.baseURL = process.env.REACT_APP_API_URL
    || ((!process.env.NODE_ENV
    || process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'dev'
    || process.env.NODE_ENV === 'local') ? 'http://127.0.0.1:8000' :  window.location.origin);

const userToken = getStoredUserToken();

axiosClient.defaults.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Authorization': `Bearer ${userToken}`,
    'Access-Control-Allow-Origin': '*'
};

// Script + TTS generation can take longer than typical API calls
axiosClient.defaults.timeout = 120000;

export default axiosClient;
