import {Avatar, Button, Card, Form, Input, Layout, Row, Space, Image, Col} from "antd";
import React, {useState} from "react";
import {Content} from "antd/es/layout/layout";
import {LockFilled, UserOutlined} from "@ant-design/icons";
import loginIcon from "../../assets/images/auth/login_icon.png";
import logo from "../../assets/images/mobiad-rectangle.png"
import logoVoda from "../../assets/images/voda.png"
import {useSelector, useDispatch} from "react-redux";
import {postRequest} from "../../services/rest/RestService";
import {setToken} from "../../state/auth/authStore";
import {useNavigate} from "react-router-dom";
import {notifyHttpError} from "../../services/notification/notifications";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.auth);
    useSelector((state: any) => state.serverConfig);
    const [isLoading, setIsLoading] = useState(false);

    const attemptLogin = (credentials: any) => {
        setIsLoading(true);
        postRequest("/api/v1/auth/login", credentials)
            .then((response) => {
                onLoginSuccessful(response.data.payload.accessToken);
            })
            .catch((errorObj) => {
                console.error(JSON.stringify(errorObj));
                notifyHttpError("Login Failed", errorObj);
                setIsLoading(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const onLoginSuccessful = (authToken: any) => {
        dispatch(setToken(authToken));
        navigate("/");
    };

    const onValidationFailed = (values: any) => {
        console.log(`values ${JSON.stringify(values)}`);
    };

    const loginTitle = (
        <Space style={{marginTop: "12px", marginBottom: "12px"}}>
            <Avatar src={loginIcon} shape="square"></Avatar>
            Login
        </Space>
    );

    return (
        <Layout style={{minHeight: "100vh"}}>

            <Content>
                <Row justify="center" align="middle">
                    <Card
                        size="small"
                        style={{width: 540, marginTop: 140, paddingLeft: 64, paddingRight: 64}}>
                        <Row>
                            <Col className="gutter-row" span={6} offset={4}>
                                <Image preview={false} src={logo} style={{width: 100, marginTop: 10}}/>
                            </Col>
                            <Col className="gutter-row" span={1} >
                            </Col>
                            <Col className="gutter-row" span={6} >
                                <Image preview={false} src={logoVoda} style={{width: 64, marginTop: 10}}/>
                            </Col>
                        </Row>

                        <Form
                            name="basic"
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={attemptLogin}
                            layout="vertical"
                            onFinishFailed={onValidationFailed}
                            requiredMark={false}
                            colon={false}
                            autoComplete="off"
                        >
                            {/*User Name*/}
                            <Form.Item
                                label="Email"
                                name="email"
                                style={{marginTop: 32}}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input your email!",
                                    },
                                ]}
                            >
                                <Input prefix={<UserOutlined/>}/>
                            </Form.Item>

                            {/*Password */}
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input your password!",
                                    },
                                ]}
                            >
                                <Input.Password prefix={<LockFilled/>}/>
                            </Form.Item>

                            {/*Login Button */}
                            <Form.Item>
                                <Button loading={isLoading} type="primary" htmlType="submit" block>
                                    Login
                                </Button>
                            </Form.Item>

                        </Form>
                    </Card>

                    <div style={{position: "absolute", bottom: "32px"}}>
                        {/*<p style={{ fontSize: "9px" }}>Powered By MobiAd Africa</p>*/}
                    </div>
                </Row>
            </Content>
        </Layout>
    );
};

export default LoginPage;
