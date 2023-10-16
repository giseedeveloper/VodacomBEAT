import {Button, Dropdown, Form, Input, MenuProps, Modal, Select, Space} from "antd";
import {
    DatabaseOutlined,
    DownOutlined, HomeOutlined,
    LockFilled, LogoutOutlined,
    MenuOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import Logout from "../services/auth/Logout";


const PopUpMenu = () => {

    const [modal1Open, setModal1Open] = useState(false);
    const [defaultServerValues, setDefaultServerValues] = useState({});

    //Fetch folders
    useEffect(() => {
        // const defaultConfigs = loadServerLocalStorage();
        // setDefaultServerValues(defaultConfigs)
    }, []);

    const attemptLogin = () => {

    }

    const handleButtonClick = () => {

    }

    const items: MenuProps['items'] = [
        {
            key: '1',
            icon: <HomeOutlined />,
            label: (
                <a href="/">
                    Home
                </a>
            ),
        },
        {
            key: '2',
            icon: <LogoutOutlined />,
            label: (
                <a href="/logout">
                    Logout
                </a>
            ),
        }
    ];

    return (
        <div>
            <div style={{position: 'absolute', top: '16px', right: '32px'}}>
                <Dropdown menu={{items}}>
                    <Button>
                        <Space>
                            Options
                            <MenuOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>

            <br/>

        </div>
    )
}

export default PopUpMenu
