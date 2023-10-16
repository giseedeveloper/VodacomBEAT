import "../css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import MainLayout from "./MainLayout";
import RequireAuth from "../services/auth/RequireAuth";
import PageNotFound from "./etc/pages/PageNotFound";
import React from "react";
import DashboardInsights from "./features/reports/DashboardInsights";
import Logout from "../services/auth/Logout";

function AppRouter() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/home" element={<RequireAuth> <MainLayout/></RequireAuth>}/>
                    <Route path="*" element={<PageNotFound></PageNotFound>}/>
                    <Route path="/*" element={<RequireAuth><MainLayout/></RequireAuth>}>
                        <Route index element={<RequireAuth><DashboardInsights/></RequireAuth>}/>
                    </Route>
                    <Route path="/logout" element={<Logout><LoginPage/></Logout>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default AppRouter;
