import axios from 'axios';
import { getStoredUserToken } from "../../state/auth/authStore";

const axiosClient = axios.create();


axiosClient.defaults.baseURL = (!process.env.NODE_ENV
    || process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'dev'
    || process.env.NODE_ENV === 'local') ? 'http://vodacom-tunes.io' : 'https://mobiad-subscriptions.eyasi.co.tz';

const userToken = getStoredUserToken();

axiosClient.defaults.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Authorization': `Bearer ${userToken}`,
    'Access-Control-Allow-Origin': '*'
};

//All request will wait 10 seconds before timeout
axiosClient.defaults.timeout = 15000;

export default axiosClient;
