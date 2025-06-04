import {Button, Card, Form, Input, Row, Space, Image, Col} from "antd";
import React, {useState} from "react";
import {LockFilled, UserOutlined} from "@ant-design/icons";
import logoWhite from "../../assets/images/voda-transparent.png"
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
             Agent Portal
        </Space>
    );

    return (
        <>
        <Row style={{ marginTop: 64}}>
            <Col className="gutter-row" span={6} offset={8}>
                <img  src={logoWhite} style={{width: 64, marginTop: 10, backgroundColor:'#E60000', padding:'12px', borderRadius:'16px'}} alt=""/>
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
                    label="Phone Number"
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
                    <Button size="large" style={{backgroundColor:"#E60000"}} loading={isLoading} type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    </>
    );
};

export default LoginPage;
