import { createSlice } from '@reduxjs/toolkit'
import {isEmpty, isNotEmpty} from "../../utils/helpers";

const USER_KEY = "loggedUser";
const SERVER_HOST = "serverHost";

const DEFAULT_USER = { name: "", token: ""};

const saveUserToStorage = (userObject) => {
    console.info(`Persisting user...  `)
    localStorage.setItem(USER_KEY,JSON.stringify(userObject));
}


export const  loadUserFromStorage = () => {

    try {
        const storedAuthState = localStorage.getItem(USER_KEY);
        if(isEmpty(storedAuthState)) {
            return DEFAULT_USER;
        }
        return JSON.parse(localStorage.getItem(USER_KEY))
    }catch (e){
        console.log(e)
       return  DEFAULT_USER;
    }
}

export const getStoredUserToken = () => {

    const user = loadUserFromStorage();
    if(isNotEmpty(user)){
        console.info("local user",JSON.stringify(user))
        return user.token;
    }else{
        console.warn("User not found on locally")
    }

    return '';
}

export const authSlice = createSlice({
    name: "auth",
    initialState:  loadUserFromStorage(),
    reducers: {
        setToken: (state,action)=>{
            state.token = action.payload;
            saveUserToStorage(state)
        },

        clearSession: (state)=>{
            console.log('Logging out');
            state.name = '';
            state.token = '';
            localStorage.clear();
        }
    }
})

export const { setToken } = authSlice.actions;

export const { clearSession } = authSlice.actions;

export default authSlice.reducer;
