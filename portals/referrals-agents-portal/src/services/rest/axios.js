import { getStoredUserToken } from "../../state/auth/authStore";
import axios from "axios";

const axiosClient = axios.create();


axiosClient.defaults.baseURL = process.env.REACT_APP_API_URL
    || ((!process.env.NODE_ENV
    || process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'dev'
    || process.env.NODE_ENV === 'local') ? 'http://127.0.0.1:8000' : window.location.origin);

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
