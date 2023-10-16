import {Image, Layout, MenuProps, Space} from 'antd';
import React, {useEffect, useState} from "react";
import '../css/custom.css';
import Dashboard from "./features/reports/Dashboard";
import {Header} from "antd/es/layout/layout";
import {getRequest} from "../services/rest/RestService";
import {notifyHttpError} from "../services/notification/notifications";
import sectionIcon from "../assets/images/voda.png";
import {Route, Routes} from "react-router-dom";
import RequireAuth from "../services/auth/RequireAuth";
import SubscriptionForm from "./features/SubscriptionForm";
import PopUpMenu from "./PopUpMenu";
import StatusPage from "./features/StatusPage";

const {Content} = Layout;

interface Agent {
    first_name: string,
    second_name: string,
    reference_number: string
}

function MainLayout() {

    return (
        <Layout style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>

            <Header style={{padding: 0, display: 'flex', alignItems: 'center', background: '#E60000'}}>
                <Space className="container" align="center">
                    <Image preview={false} width={48} height={48} src={sectionIcon} style={{marginTop: '2px', marginLeft:'8px', marginRight: '24'}}></Image>
                    <h2 style={{color: '#ffffff', padding: '16px'}}>
                        <span style={{fontWeight: 'bolder'}}>MobiAd</span></h2>
                </Space>
            </Header>

            <Content style={{minHeight: '100vh', padding: '0 0'}}>
                <Routes>

                    <Route path="home" element={<SubscriptionForm/>}/>

                    <Route path="customers">
                        <Route index element={<SubscriptionForm/>}/>
                    </Route>

                    <Route path="subscriptions/:reference" >
                        <Route index element={<StatusPage/>} />
                    </Route>

                    <Route path="*" element={<SubscriptionForm/>}/>
                </Routes>

            </Content>

            <PopUpMenu></PopUpMenu>

        </Layout>

    );
}

export default MainLayout






