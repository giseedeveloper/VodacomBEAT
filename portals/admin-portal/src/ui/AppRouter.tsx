import "../css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import MainLayout from "./MainLayout";
import RequireAuth from "../services/auth/RequireAuth";
import SystemUsersComponent from "./system/users/SystemUsersComponent";
import RolesComponent from "./system/users/RolesComponent";
import PageNotFound from "./etc/pages/PageNotFound";
import React from "react";
import DashboardInsights from "./reports/DashboardInsights";
import TransactionsListComponent from "./features/transactions/TransactionsListComponent";
import Logout from "../services/auth/Logout";
import ContestantComponent from "./system/users/ContestantComponent";
import SubscribersListComponent from "./features/subscribers/SubscribersListComponent";
import MessagesTemplatesComponent from "./features/messages/MessagesTemplatesComponent";
import ReferralsComponent from "./features/management/agents/AgentsComponent";
import TeamsTopicsComponent from "./features/management/teams/TeamsTopicsComponent";
import SmsHistoryComponent from "./features/messages/SmsHistoryComponent";
import NotificationTemplatesComponent from "./features/management/notications/NotificationTemplatesComponent";
import SmsGatewayManagementComponent from "./features/management/sms_gateways/SmsGatewayManagementComponent";
import CommissionsListComponent from "./features/commissions/CommissionsListComponent";
import SubscriptionPackagesComponent from "./features/management/packages/SubscriptionPackagesComponent";

function AppRouter() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    {/*<Route index element={<RequireAuth><MainLayout/></RequireAuth>}/>*/}

                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/home" element={<RequireAuth> <MainLayout/></RequireAuth>}/>
                    <Route path="*" element={<PageNotFound></PageNotFound>}/>

                    <Route path="/*" element={<RequireAuth><MainLayout/></RequireAuth>}>
                        <Route index element={<RequireAuth><DashboardInsights/></RequireAuth>}/>

                        <Route path="transactions">
                            <Route index element={<RequireAuth><TransactionsListComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="subscriptions">
                            <Route index element={<RequireAuth><SubscribersListComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="messages">
                            <Route index element={<RequireAuth><MessagesTemplatesComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="sms-history">
                            <Route index element={<RequireAuth><SmsHistoryComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="packages">
                            <Route index element={<RequireAuth><SubscriptionPackagesComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="agents">
                            <Route index element={<RequireAuth><ReferralsComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="commissions">
                            <Route index element={<RequireAuth><CommissionsListComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="teams">
                            <Route index element={<RequireAuth><TeamsTopicsComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="notifications">
                            <Route index element={<RequireAuth><NotificationTemplatesComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="sms/gateways">
                            <Route index element={<RequireAuth><SmsGatewayManagementComponent/></RequireAuth>}/>
                        </Route>

                        <Route path="users" element={<RequireAuth><SystemUsersComponent/></RequireAuth>}/>
                        <Route path="roles" element={<RequireAuth><RolesComponent/></RequireAuth>}/>
                        <Route path="shipping" element={<RequireAuth><ContestantComponent/></RequireAuth>}
                        />
                    </Route>
                    <Route path="/logout" element={<Logout><LoginPage/></Logout>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default AppRouter;
