import {Image, Layout, Space} from 'antd';
import React from "react";
import '../css/custom.css';
import '../css/beat-wizard.css';
import {Header} from "antd/es/layout/layout";
import vodaRedIcon from "../assets/images/voda-transparent.png";
import {Route, Routes} from "react-router-dom";
import SubscriptionWizard from "./features/wizard/SubscriptionWizard";
import PopUpMenu from "./PopUpMenu";
import StatusPage from "./features/StatusPage";

const {Content} = Layout;

function MainLayout() {
    return (
        <Layout style={{minHeight: '100vh', backgroundColor: '#ffffff'}}>
            <Header style={{padding: 0, display: 'flex', alignItems: 'center', background: '#E60000'}}>
                <Space className="container" align="center">
                    <Image
                        preview={false}
                        width={32}
                        height={32}
                        src={vodaRedIcon}
                        style={{marginTop: '2px', marginLeft: '8px', marginRight: 24}}
                    />
                    <h2 style={{color: '#ffffff', padding: '16px'}}>
                        <span style={{fontWeight: 'bolder'}}>BizTune</span>
                    </h2>
                </Space>
            </Header>

            <Content style={{minHeight: '100vh', padding: '0 0'}}>
                <Routes>
                    <Route path="home" element={<SubscriptionWizard/>}/>
                    <Route path="subscribe" element={<SubscriptionWizard/>}/>
                    <Route path="subscribe/:reference" element={<SubscriptionWizard/>}/>
                    <Route path="customers" element={<SubscriptionWizard/>}/>
                    <Route path="subscriptions/:reference" element={<StatusPage/>}/>
                    <Route path="*" element={<SubscriptionWizard/>}/>
                </Routes>
            </Content>

            <PopUpMenu/>
        </Layout>
    );
}

export default MainLayout;
