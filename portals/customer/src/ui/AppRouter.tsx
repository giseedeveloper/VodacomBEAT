import "../css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import MainLayout from "./MainLayout";
import PageNotFound from "./etc/pages/PageNotFound";
import React from "react";
import Logout from "../services/auth/Logout";
import SubscriptionWizard from "./features/wizard/SubscriptionWizard";
import StatusPage from "./features/StatusPage";

function AppRouter() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/logout" element={<Logout><LoginPage/></Logout>}/>

                    <Route path="/*" element={<MainLayout/>}>
                        <Route index element={<SubscriptionWizard/>}/>
                        <Route path="home" element={<SubscriptionWizard/>}/>
                        <Route path="subscribe" element={<SubscriptionWizard/>}/>
                        <Route path="subscribe/:reference" element={<SubscriptionWizard/>}/>
                        <Route path="customers" element={<SubscriptionWizard/>}/>
                        <Route path="subscriptions/:reference" element={<StatusPage/>}/>
                    </Route>

                    <Route path="*" element={<PageNotFound/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default AppRouter;
