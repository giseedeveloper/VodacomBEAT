import "../css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import MainLayout from "./MainLayout";
import RequireAuth from "../services/auth/RequireAuth";
import PageNotFound from "./etc/pages/PageNotFound";
import React from "react";
import Dashboard from "./features/reports/Dashboard";
import Logout from "../services/auth/Logout";
import SubscriptionForm from "./features/SubscriptionForm";
import StatusPage from "./features/StatusPage";

function AppRouter() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    <Route path="/*" element={<MainLayout/>}>
                        <Route index element={<SubscriptionForm/>}/>
                        <Route path="home" element={<SubscriptionForm/>}/>

                        <Route path="customers" >
                            <Route index element={<SubscriptionForm/>} />
                        </Route>

                        <Route path="subscriptions/:reference" >
                            <Route index element={<StatusPage/>} />
                        </Route>

                    </Route>
                    <Route path="/logout" element={<Logout><LoginPage/></Logout>}/>

                    <Route path="*" element={<PageNotFound></PageNotFound>}/>
                </Routes>

            </BrowserRouter>
        </div>
    );
}

export default AppRouter;
