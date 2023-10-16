import {Card, Col, Divider, Row, Space, Table, Tag} from 'antd';
import React, {useState, useEffect} from 'react';
import DashboardStatistic from "./DashboardStatistic";
import {CiDollar, CiUser} from "react-icons/ci";
import {HiChartBar, HiOutlineCalendar, HiOutlineCash, HiOutlineCloud, HiOutlineSun, HiUserGroup} from "react-icons/hi";
import {AiOutlineBarChart, AiOutlineUsergroupAdd} from "react-icons/ai";
import StatisticsGroup from "./StatisticsGroup";
import {getRequest} from "../../../services/rest/RestService";
import {notifyHttpError} from "../../../services/notification/notifications";
import {HiOutlineCalendarDays} from "react-icons/hi2";
import {WiDayCloudy} from "react-icons/wi";
import { TbChartDonutFilled} from "react-icons/tb";


const headerTextColor = '#0092ff';

interface Stats {

    "weekTransactionsCount": number,
    "weekTransactionsAmount": number,
    "monthTransactionsAmount": number,
    "daySubscriptionsCount": number,
    "activeSubscriptions": number
}

const DashboardInsights = () => {

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
        getRequest("/api/v1/reports/stats").then((response) => {
            setStats(response.data.payload);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    return <div style={{
        paddingLeft: '24px',
        paddingRight: '24px',
        marginTop: "24px",
        marginBottom: "64px",
    }}>


        {/**
         -----------------------
         | Subscriptions Stats
         -------------------------
         */}
        <StatisticsGroup
            title="My Statistics"
            textColor={headerTextColor}
        >
            <Row gutter={16}>

                {/*Completed Orders Count*/}
                {/*New Subscribers*/}
                <Col className="gutter-row" span={24}>
                    <DashboardStatistic
                        textColor="#06d6a0"
                        icon={<HiUserGroup
                            color="#06d6a0"
                            size={48}>
                        </HiUserGroup>}
                        title="Subscribers Today"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.activeSubscriptions??0)}`}
                    ></DashboardStatistic>
                </Col>

                {/*Lost Subscribers*/}
                <Col className="gutter-row" span={24} style={{marginTop:'2em'}}>
                    <DashboardStatistic
                        textColor="#9b5de5"
                        icon={<WiDayCloudy
                            color="#9b5de5"
                            size={48}>
                        </WiDayCloudy>}
                        title="Commission Today"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySubscriptionsCount??0)} TZS`}
                    ></DashboardStatistic>
                </Col>

                {/*Week commission*/}
                <Col className="gutter-row" span={24} style={{marginTop:'2em'}}>
                    <DashboardStatistic
                        textColor="#9b5de5"
                        icon={<AiOutlineBarChart
                            color="#9b5de5"
                            size={48}>
                        </AiOutlineBarChart>}
                        title="Commission This Week"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySubscriptionsCount??0)} TZS`}
                    ></DashboardStatistic>
                </Col>

                {/*Month Commission*/}
                <Col className="gutter-row" span={24} style={{marginTop:'2em'}}>
                    <DashboardStatistic
                        textColor="#9b5de5"
                        icon={<HiOutlineCalendarDays
                            color="#9b5de5"
                            size={48}>
                        </HiOutlineCalendarDays>}
                        title="Commission This Month"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySubscriptionsCount??0)} TZS`}
                    ></DashboardStatistic>
                </Col>

                {/*All time Commission*/}
                <Col className="gutter-row" span={24} style={{marginTop:'2em'}}>
                    <DashboardStatistic
                        textColor="#9b5de5"
                        icon={<HiOutlineCash
                            color="#9b5de5"
                            size={48}>
                        </HiOutlineCash>}
                        title="Commission All Time"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySubscriptionsCount??0)} TZS`}
                    ></DashboardStatistic>
                </Col>


            </Row>

        </StatisticsGroup>

    </div>;

}

export default DashboardInsights

