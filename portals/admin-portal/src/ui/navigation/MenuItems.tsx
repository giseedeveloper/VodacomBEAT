import {
    ContainerOutlined,
    DesktopOutlined,
    SettingOutlined,
    LogoutOutlined,
    UsergroupAddOutlined,
    MessageOutlined, PercentageOutlined
} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Menu} from 'antd';
import React from 'react';
import {useNavigate} from "react-router-dom";
import {CiBullhorn} from "react-icons/ci";

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

    toMenuItem('Commissions', '/commissions', <PercentageOutlined/>),

    toMenuItem('Configurations', 'setting/index', <SettingOutlined/>, [
        toMenuItem('Packages', '/packages', <CiBullhorn/>),
        toMenuItem('Agents', '/agents', <CiBullhorn/>),
        toMenuItem('System Users', '/users', <UsergroupAddOutlined/>),
        toMenuItem('Notifications', '/notifications', <MessageOutlined/>),
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
