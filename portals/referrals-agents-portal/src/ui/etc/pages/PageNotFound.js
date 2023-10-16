import {Avatar, Button, Card, Checkbox, Form, Image, Input, Layout, PageHeader, Row} from 'antd';
import React from 'react';
import {Content} from "antd/es/layout/layout";
import {LockFilled, UserOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import notFoundImage from '../../../assets/images/etc/404-error.png'

const PageNotFound = () => {

    const navigate = useNavigate();

    return (

        <Layout style={{minHeight: '100vh'}}>
            <Content>

                <Row type="flex" justify="center" align="middle">

                    <Card size="small" style={{width: 540, marginTop: 140, paddingTop: 32, paddingBottom: 32}}>
                        <Image
                            src={notFoundImage}
                            width={120}
                        />
                        <p style={{marginTop:16}}>Feature Under Construction! </p>
                    </Card>
                </Row>
            </Content>
        </Layout>
    );
};

export default PageNotFound;
