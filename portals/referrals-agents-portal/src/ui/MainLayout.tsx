import {Button, Layout, Skeleton, Space} from 'antd';
import React, {useEffect, useState} from "react";
import '../css/custom.css';
import DashboardInsights from "./features/reports/DashboardInsights";
import {Header} from "antd/es/layout/layout";
import {UserOutlined} from "@ant-design/icons";
import {getRequest} from "../services/rest/RestService";
import {notifyHttpError} from "../services/notification/notifications";

const {Content} = Layout;

interface Agent {
    first_name : string,
    second_name : string,
    reference_number : string
}

function MainLayout() {

    const [isLoading, setIsLoading] = useState(true);
    const [agent, setAgent] = useState<Agent>();

    //Fetch products
    useEffect(() => {
        fetchAgent();
    }, []);

    //Fetch Stats
    const fetchAgent = () => {
        console.log("Fetching stats...")
        setIsLoading(true)
        getRequest("/api/v1/referrals/agent").then((response) => {
            console.log(JSON.stringify(response.data.payload))
            setAgent(response.data.payload.agent);
            setIsLoading(false)
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }


    return (
        <Layout style={{minHeight: '100vh'}} className="site-layout">
            <Header style={{padding: 0, display: 'flex', alignItems: 'center', background: '#edf6f9'}}>

                <Space>
                    <Button
                        type="text"
                        icon={<UserOutlined/>}
                        onClick={() => {

                        }}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <p>{agent?.first_name??''} {agent?.second_name??''} - <span style={{fontWeight:'bolder'}}>{agent?.reference_number??''}</span></p>
                </Space>
            </Header>
            <Content style={{minHeight: '100vh', padding: '0 0'}}>

                <Skeleton style={{marginTop:'2em'}}

                          active={true}
                          loading={isLoading}
                          avatar paragraph={{ rows: 4 }} />
                <DashboardInsights></DashboardInsights>

            </Content>
        </Layout>
    );
}

export default MainLayout






