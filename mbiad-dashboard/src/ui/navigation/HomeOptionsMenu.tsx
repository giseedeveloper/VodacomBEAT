import {AppstoreAddOutlined, AppstoreOutlined} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Divider, Button } from 'antd';
import React from 'react';
import '../../css/home-menu.css'
import {clearSession} from "../../state/auth/authStore";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";

const items: MenuProps['items'] = [
    {
        key: '1_help',
        label: (
            <a target="_blank" rel="noopener noreferrer" href="#">
                Get Help
            </a>
        ),
    },
    {
        key: '2_password',
        label: (
            <a target="_blank" rel="noopener noreferrer" href="#">
               Change Password
            </a>
        ),
        disabled: false,
    }
];

const HomeOptionsMenu = ()=>{

    const navigate = useNavigate()
    const dispatch = useDispatch();

    const logout = () => {
        dispatch(clearSession())
        navigate('/login')
    }

    return  <Dropdown
        menu={{ items }}
        dropdownRender={menu => (
            <div className="dropdown-content">
                {menu}
                <Divider style={{ margin: 0 }} />
                <Space style={{ padding: 8 }}>
                    <Button onClick={logout} type="primary">Logout</Button>
                </Space>
            </div>
        )}>
        <Button type="primary" shape="circle" icon={<AppstoreOutlined/>} />
    </Dropdown>;
};

export default HomeOptionsMenu;


