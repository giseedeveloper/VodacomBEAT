import "../css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import MainLayout from "./MainLayout";
import RequireAuth from "../services/auth/RequireAuth";
import PageNotFound from "./etc/pages/PageNotFound";
import React from "react";
import Dashboard from "./features/reports/Dashboard";
import Logout from "../services/auth/Logout";
import CustomerForm from "./features/customers/CustomerForm";

function AppRouter() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>

                    <Route path="/*" element={<RequireAuth><MainLayout/></RequireAuth>}>
                        <Route index element={<RequireAuth><Dashboard/></RequireAuth>}/>
                        <Route path="home" element={<RequireAuth> <Dashboard/></RequireAuth>}/>

                        <Route path="customers" >
                            <Route index element={<RequireAuth><CustomerForm/></RequireAuth>} />
                            <Route path="new" element={<RequireAuth><CustomerForm /></RequireAuth>}/>
                            <Route path=":customerId" element={<RequireAuth><CustomerForm/></RequireAuth>}  />
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
