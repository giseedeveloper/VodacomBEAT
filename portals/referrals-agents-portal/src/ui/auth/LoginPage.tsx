import {Avatar, Button, Card, Form, Input, Layout, Row, Space, Image, Col} from "antd";
import React, {useState} from "react";
import {Content} from "antd/es/layout/layout";
import {LockFilled, UserOutlined} from "@ant-design/icons";
import loginIcon from "../../assets/images/auth/login_icon.png";
import logo from "../../assets/images/mobiad-rectangle.png"
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
            Login: Commission Portal
        </Space>
    );

    return (
        <>
        <Row style={{ marginTop: 64}}>
            <Col className="gutter-row" span={6} offset={8}>
                <Image preview={false} src={logo} style={{width: 100, marginTop: 10}}/>
            </Col>
        </Row>

        <Card
            title={loginTitle}
            size="small"
            style={{width: '100%',marginTop: "2.6em", paddingLeft: "1em", paddingRight: "1em"}}>

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
                <Form.Item style={{marginTop: '2.6em'}}>
                    <Button loading={isLoading} type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    </>
    );
};

export default LoginPage;
