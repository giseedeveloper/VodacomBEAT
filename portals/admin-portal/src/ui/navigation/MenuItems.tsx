import {
    ContainerOutlined,
    DesktopOutlined,
    SettingOutlined,
    LogoutOutlined,
    UsergroupAddOutlined,
    MessageOutlined, ClockCircleOutlined, PercentageOutlined
} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Menu} from 'antd';
import React from 'react';
import {useNavigate} from "react-router-dom";
import {CiBullhorn} from "react-icons/ci";
import {BiFootball} from "react-icons/bi";
import {FaBroadcastTower} from "react-icons/fa";

type MenuItem = Required<MenuProps>['items'][number];

function toMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[], type?: 'group'): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const items: MenuProps['items'] = [

    toMenuItem('Home', '/', <DesktopOutlined/>),

    toMenuItem('Transactions', '/transactions', <ContainerOutlined/>),

    toMenuItem('Subscriptions', '/subscriptions', <UsergroupAddOutlined/>),

    toMenuItem('SMS Broadcasts', '/messages', <MessageOutlined/>),

    toMenuItem('SMS History', '/sms-history', <ClockCircleOutlined/>),

    toMenuItem('Commissions', '/commissions', <PercentageOutlined/>),

    toMenuItem('Configurations', 'setting/index', <SettingOutlined/>, [
        toMenuItem('System Users', '/users', <UsergroupAddOutlined/>),
        toMenuItem('Notifications', '/notifications', <MessageOutlined/>),
        toMenuItem('SMS Gateways', '/sms/gateways', <FaBroadcastTower/>),
        toMenuItem('Teams/Topics Setup', '/teams', <BiFootball/>),
        toMenuItem('Referrals Agents', '/referrals', <CiBullhorn/>),
    ]),

    toMenuItem('Logout', '/logout', <LogoutOutlined/>),
];

interface Props {
    isInlineCollapsed: boolean;
}

const MenuItems: React.FC<Props> = ({isInlineCollapsed}) => {

    const navigate = useNavigate();

    const onMenuItemClick = (event: { item: any, key: any, keyPath: any, domEvent: any }) => {
        const uri = event.key;
        console.log('~Selected navigation uri ', uri);
        navigate(uri)
    }

    return (
        <Menu
            onClick={onMenuItemClick}
            // style={{height: '100%'}}
            defaultSelectedKeys={['/transactions']}
            theme="light"
            mode="inline"
            items={items}
        />
    );
};

export default MenuItems;
