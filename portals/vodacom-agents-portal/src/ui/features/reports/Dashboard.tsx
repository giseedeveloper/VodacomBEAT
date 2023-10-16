import {Button, Col, Row, Space} from 'antd';
import React, {useState, useEffect} from 'react';
import StatisticItem from "./StatisticItem";
import { HiUserGroup} from "react-icons/hi";
import {getRequest} from "../../../services/rest/RestService";
import {notifyHttpError} from "../../../services/notification/notifications";
import {HiOutlineCalendarDays} from "react-icons/hi2";
import {WiDayCloudy} from "react-icons/wi";
import {ArrowUpOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {BsArrowUpCircle, BsCashCoin} from "react-icons/bs";

interface Stats {
    "customersCount": number,
    "entitledCommission": number,
    "dayCommissions": number,
    "monthCommissions": number,
    "withdrawsCount": number,
}

const Dashboard = () => {

    const [, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Stats>();

    //Fetch products
    useEffect(() => {
        fetchStats();
    }, []);

    //Fetch Stats
    const fetchStats = () => {
        console.log("Fetching stats...")
        setIsLoading(true)
        getRequest("/api/v1/tunes/agent/stats").then((response) => {
            setStats(response.data.payload);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    return <div style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        marginTop: "24px",
        marginBottom: "64px",
    }}>


        {/**
         -----------------------
         | Subscriptions Stats
         -------------------------
         */}
        <Row gutter={16}>

            {/*My Commissions*/}
            <Col className="gutter-row" span={24}>
                <StatisticItem
                    textColor="#E60000"
                    icon={<BsCashCoin
                        color="#E60000"
                        size={48}>
                    </BsCashCoin>}
                    title="Commissions"
                    subTitle={`${new Intl.NumberFormat('en-US').format(stats?.entitledCommission ?? 0)} TZS`}
                ></StatisticItem>
            </Col>

        </Row>


        {/*Action Buttons*/}
        <Space.Compact block style={{marginTop: "24px"}} >
            <Button href="/customers/new"  style={{ width: '50%',backgroundColor:"#E60000" }} type="primary" icon={<PlusCircleOutlined/>} size="middle">Add Customer</Button>
            <Button  style={{ width: '50%',backgroundColor:"#E60000"  }} type="primary" icon={<ArrowUpOutlined/>} size="middle">Withdraw Cash</Button>
        </Space.Compact>

        <Row gutter={16}>
            {/*Day Commissions*/}
            <Col className="gutter-row" span={24} style={{marginTop: '2em'}}>
                <StatisticItem
                    textColor="#E60000"
                    icon={<WiDayCloudy
                        color="#E60000"
                        size={48}>
                    </WiDayCloudy>}
                    title="Commission Today"
                    subTitle={`${new Intl.NumberFormat('en-US').format(stats?.dayCommissions ?? 0)} TZS`}
                ></StatisticItem>
            </Col>

            {/*Month Commission*/}
            <Col className="gutter-row" span={24} style={{marginTop: '2em'}}>
                <StatisticItem
                    textColor="#E60000"
                    icon={<HiOutlineCalendarDays
                        color="#E60000"
                        size={48}>
                    </HiOutlineCalendarDays>}
                    title="Commission This Month"
                    subTitle={`${new Intl.NumberFormat('en-US').format(stats?.monthCommissions ?? 0)} TZS`}
                ></StatisticItem>
            </Col>


            {/*My Customers*/}
            <Col className="gutter-row" span={12} style={{marginTop:'24px'}}>
                <StatisticItem
                    textColor="#E60000"
                    icon={<HiUserGroup
                        color="#E60000"
                        size={32}>
                    </HiUserGroup>}
                    title="Customers"
                    subTitle={`${new Intl.NumberFormat('en-US').format(stats?.customersCount ?? 0)}`}
                ></StatisticItem>
            </Col>

            {/*My Customers*/}
            <Col className="gutter-row" span={12} style={{marginTop:'24px'}}>
                <StatisticItem
                    textColor="#E60000"
                    icon={<BsArrowUpCircle
                        color="#E60000"
                        size={32}>
                    </BsArrowUpCircle>}
                    title="Withdraws"
                    subTitle={`${new Intl.NumberFormat('en-US').format(stats?.withdrawsCount ?? 0)}`}
                ></StatisticItem>
            </Col>

        </Row>

    </div>;

}

export default Dashboard

