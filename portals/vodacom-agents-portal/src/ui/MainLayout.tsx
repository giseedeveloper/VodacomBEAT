import {Button, Image, Layout, MenuProps, Space} from 'antd';
import React, {useEffect, useState} from "react";
import '../css/custom.css';
import Dashboard from "./features/reports/Dashboard";
import {Header} from "antd/es/layout/layout";
import {getRequest} from "../services/rest/RestService";
import {notifyHttpError} from "../services/notification/notifications";
import sectionIcon from "../assets/images/voda.png";
import vodacomIcon from "../assets/images/voda-red.png";
import {Route, Routes} from "react-router-dom";
import RequireAuth from "../services/auth/RequireAuth";
import CustomerForm from "./features/customers/CustomerForm";
import PopUpMenu from "./PopUpMenu";
import AgentCustomers from "./features/customers/history/AgentCustomers";
import {HomeOutlined} from "@ant-design/icons";

const {Content} = Layout;

interface Agent {
    first_name: string,
    second_name: string,
    reference_number: string
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


    const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
        key,
        label: `nav ${key}`,
    }));

    return (
        <Layout style={{minHeight: '100vh'}}>

            <Header style={{padding: 0, display: 'flex', alignItems: 'center', background: '#E60000'}}>

                <Space align="center">
                    <Image preview={false} width={48} height={48} src={vodacomIcon} style={{marginTop: '2px', marginLeft:'8px', marginRight: '6px'}}></Image>
                    <h3 style={{color: '#ffffff', marginLeft:"16px"}}>
                        <span style={{fontWeight: 'lighter'}}>{agent?.first_name ?? ''}</span> ~
                        <span style={{fontWeight: 'bolder'}}>{agent?.reference_number ?? ''}</span></h3>
                    <Button  style={{marginRight:"16px", color:"#E60000", marginLeft:"24px"}} icon={<HomeOutlined/>} href="/">Home</Button>

                </Space>
            </Header>

            <Content style={{minHeight: '100vh', padding: '0 0'}}>
                <Routes>

                    <Route path="home" element={<RequireAuth><Dashboard/></RequireAuth>}/>

                    <Route path="customers">
                        <Route index element={<RequireAuth><CustomerForm/></RequireAuth>}/>
                        <Route path="new" element={<RequireAuth><CustomerForm/></RequireAuth>}/>
                        <Route path="history" element={<RequireAuth><AgentCustomers /></RequireAuth>}/>
                        <Route path="customer/:customerId" element={<RequireAuth><CustomerForm/></RequireAuth>}/>
                    </Route>

                    <Route path="*" element={<RequireAuth><Dashboard/></RequireAuth>}/>
                </Routes>


            </Content>

            <PopUpMenu></PopUpMenu>

        </Layout>

    );
}

export default MainLayout






