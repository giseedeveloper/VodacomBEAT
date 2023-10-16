import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './ui/AppRouter';
import reportWebVitals from './reportWebVitals';
import {configureStore} from "@reduxjs/toolkit";
import  authReducer  from "./state/auth/authStore";
import  serverReducer  from "./state/auth/serverConfigsStore";
import {Provider} from "react-redux";

const appStateStore = configureStore({
    reducer: {
        auth : authReducer,
        serverConfig : serverReducer
    }
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={appStateStore}>
        <AppRouter />
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


