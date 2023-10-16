import { createSlice } from '@reduxjs/toolkit'
import { isEmpty, isNotEmpty } from "../../utils/helpers";

const SERVER_HOST = "serverHost";

//const DEFAULT_SERVER = { host: "164.90.179.176:1971", protocol: "http://"};
const DEFAULT_SERVER = { host: "api.fca.co.tz", protocol: "http://" };

const saveServerToStorage = (serverObject) => {
    console.info(`Persisting server config...  `)
    localStorage.setItem(SERVER_HOST, JSON.stringify(serverObject));
}


export const loadServerLocalStorage = () => {

    try {
        const storedAuthState = localStorage.getItem(SERVER_HOST);
        if (isEmpty(storedAuthState)) {
            return DEFAULT_SERVER;
        }
        return JSON.parse(localStorage.getItem(SERVER_HOST))
    } catch (e) {
        console.log(e)
        return DEFAULT_SERVER;
    }
}

export const getStoredUserToken = () => {

    const user = loadServerLocalStorage();
    if (isNotEmpty(user)) {
        return user.token;
    }

    return '';
}

export const authSlice = createSlice({
    name: "server",
    initialState: loadServerLocalStorage(),
    reducers: {
        setServer: (state, action) => {
            state.token = action.payload;
            saveServerToStorage(state)
        },

        clearSession: (state) => {
            console.log('Logging out');
            state.name = '';
            state.token = '';
            localStorage.clear();
        }
    }
})

export const { setServer } = authSlice.actions;

export const { clearSession } = authSlice.actions;

export default authSlice.reducer;
