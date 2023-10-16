import {Layout, notification} from 'antd';
import {Route, Routes} from "react-router-dom";

import React from "react";

import '../css/custom.css';
import LeftSideMenu from "./navigation/LeftSideMenu";
import SystemUsersComponent from "./system/users/SystemUsersComponent";
import RolesComponent from "./system/users/RolesComponent";
import DashboardInsights from "./reports/DashboardInsights";

import RequireAuth from "../services/auth/RequireAuth";
import TransactionsListComponent from "./features/transactions/TransactionsListComponent";
import SubscribersListComponent from "./features/subscribers/SubscribersListComponent";
import MessagesTemplatesComponent from "./features/messages/MessagesTemplatesComponent";
import ReferralsComponent from "./features/management/referrals/ReferralsComponent";
import TeamsTopicsComponent from "./features/management/teams/TeamsTopicsComponent";
import SmsHistoryComponent from "./features/messages/SmsHistoryComponent";
import NotificationTemplatesComponent from "./features/management/notications/NotificationTemplatesComponent";
import SmsGatewayManagementComponent from "./features/management/sms_gateways/SmsGatewayManagementComponent";
import CommissionsListComponent from "./features/commissions/CommissionsListComponent";

const {Content} = Layout;

function MainLayout() {


    return (
        <Layout style={{minHeight: '100vh'}}>

            {/*<SystemVersion></SystemVersion>*/}

            <LeftSideMenu></LeftSideMenu>

            <Layout className="site-layout" style={{marginLeft: 280}}>
                <Content style={{minHeight: '100vh', padding: '0 0'}}>

                    <Routes>
                        {/*<Route index element={<RolesComponent/>}/>*/}

                        <Route path="transactions" >
                            <Route index element={<RequireAuth><TransactionsListComponent/></RequireAuth>} />
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

                        <Route path="referrals">
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

                        <Route path="/users" element={<RequireAuth><SystemUsersComponent /></RequireAuth>}/>
                        <Route path="/roles" element={<RequireAuth><RolesComponent /></RequireAuth>}/>
                        <Route path="*" element={<RequireAuth><DashboardInsights/></RequireAuth>}/>
                    </Routes>

                </Content>
            </Layout>
        </Layout>
    );
}

export default MainLayout






