import {Button, Form, Input, Modal, Select} from "antd";
import {CloudServerOutlined, DatabaseOutlined, LockFilled, SettingOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {loadServerLocalStorage} from "../../../state/auth/serverConfigsStore";


const QuickServerConfig = () => {

    const [modal1Open, setModal1Open] = useState(false);
    const [modal2Open, setModal2Open] = useState(false);
    const [defaultServerValues, setDefaultServerValues] = useState({});

    //Fetch folders
    useEffect(() => {
        const defaultConfigs = loadServerLocalStorage();
        setDefaultServerValues(defaultConfigs)
    }, []);

    const attemptLogin = () => {

    }

    const onValidationFailed = () => {

    }

    return (
        <div>
            <div style={{position: 'absolute', bottom: '32px', right: '32px'}}>
                <Button onClick={() => setModal1Open(true)}
                        shape="circle" icon={<SettingOutlined/>}/>
            </div>
            <Modal
                title="Server Configs"
                style={{right: 24, top: 24, position: 'absolute'}}
                open={modal1Open}
                onOk={() => setModal1Open(false)}
                onCancel={() => setModal1Open(false)}
            >

                <Form
                    name="basic"
                    labelCol={{
                        span: 6,
                    }}
                    initialValues={defaultServerValues}
                    onFinish={attemptLogin}
                    onFinishFailed={onValidationFailed}
                    requiredMark={false}
                    colon={false}
                    autoComplete="off">

                    {/*User Name*/}
                    <Form.Item
                        label="Host Address"
                        name="host"
                        style={{marginTop: 4}}
                        initialValue={{}}
                        rules={[
                            {
                                required: true,
                                message: 'Please input server address!'
                            },
                        ]}
                    >
                        <Input suffix={<DatabaseOutlined/>}/>
                    </Form.Item>

                    <Form.Item
                        label="Protocol"
                        name="protocol">
                        <Select suffixIcon={<LockFilled/>}>
                            <Select.Option value="http://">HTTP (Less secure)</Select.Option>
                            <Select.Option value="https://">HTTPS (Secure)</Select.Option>
                        </Select>
                    </Form.Item>

                    {/*/!*Login Button *!/*/}
                    {/*<Form.Item wrapperCol={{}}>*/}
                    {/*    <Button type="primary" htmlType="submit">*/}
                    {/*        Login*/}
                    {/*    </Button>*/}
                    {/*</Form.Item>*/}

                </Form>

            </Modal>
            <br/>

        </div>
    )
}

export default QuickServerConfig