import {Card, Col, Divider, Row, Space, Table, Tag} from 'antd';
import React, {useState, useEffect} from 'react';
import DashboardStatistic from "./DashboardStatistic";
import {CiDollar} from "react-icons/ci";
import {HiCash, HiOutlineHashtag, HiUserGroup} from "react-icons/hi";
import {AiOutlineUsergroupAdd} from "react-icons/ai";
import StatisticsGroup from "./StatisticsGroup";
import {getRequest} from "../../services/rest/RestService";
import {notifyHttpError} from "../../services/notification/notifications";
import {SubscriptionStats, TeamTopic} from "../../interfaces/MessagesInterfaces";
import {GiSoccerBall} from "react-icons/gi";
import {BsCashCoin, BsEnvelope} from "react-icons/bs";


// const headerTextColor: string = '#0092ff';

interface Stats {

    "dayTransactionsAmount": number,
    "weekTransactionsAmount": number,
    "monthTransactionsAmount": number,
    "allTimeTransactionsAmount": number,

    "daySubscriptionsCount": number,
    "activeSubscriptions": number,
    "weekSubscriptions": number,
    "monthSubscriptions": number,
    "allTimeSubscriptions": number,

    "daySmsCounter": number,
    "weekSmsCounter": number,
    "monthSmsCounter": number,
    "allTimeSmsCounter": number
}

const DashboardInsights = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Stats>();
    const [teams, setTeams] = useState<TeamTopic[]>([]);
    const [subscriptionsByCode, setSubscriptionsByCode] = useState<SubscriptionStats[]>([]);

    //Fetch products
    useEffect(() => {
        fetchStats();
        fetchTeamStats();
        fetchSubscriptionsByCode();
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

    //Fetch Stats
    const fetchTeamStats = () => {
        console.log("Fetching team stats...")
        setIsLoading(true)
        getRequest("/api/v1/reports/stats/teams").then((response) => {
            setTeams(response.data.payload.teams);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    //Fetch subscriptions by transaction code
    const fetchSubscriptionsByCode = () => {
        console.log("Fetching subscription code stats...")
        setIsLoading(true)
        getRequest("/api/v1/reports/stats/by/reference").then((response) => {
            setSubscriptionsByCode(response.data.payload.stats);
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
            title="Subscriptions"
            textColor="#34a0a4"
        >
            <Row gutter={16}>

                {/*Completed Orders Count*/}
                {/*Active Subscribers*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#06d6a0"
                        icon={<HiUserGroup
                            color="#06d6a0"
                            size={48}>
                        </HiUserGroup>}
                        title="Active Subscribers"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.activeSubscriptions ?? 0)}`}
                    ></DashboardStatistic>
                </Col>

                {/*Day Subscribers*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#9b5de5"
                        icon={<AiOutlineUsergroupAdd
                            color="#9b5de5"
                            size={48}>
                        </AiOutlineUsergroupAdd>}
                        title="Subscribed Today"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySubscriptionsCount ?? 0)}`}
                    ></DashboardStatistic>
                </Col>


                {/*Month Subscribers*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#ee6c4d"
                        icon={<AiOutlineUsergroupAdd
                            color="#ee6c4d"
                            size={48}>
                        </AiOutlineUsergroupAdd>}
                        title="Subscribed This Month"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.monthSubscriptions ?? 0)}`}
                    ></DashboardStatistic>
                </Col>

                {/*All Time Subscribers*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#48cae4"
                        icon={<AiOutlineUsergroupAdd
                            color="#48cae4"
                            size={48}>
                        </AiOutlineUsergroupAdd>}
                        title="All Time Subscriptions"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.allTimeSubscriptions ?? 0)}`}
                    ></DashboardStatistic>
                </Col>

            </Row>

        </StatisticsGroup>


        {/**
         ------------------------
         | Transactions Stats
         ------------------------
         */}
        <StatisticsGroup
            title="Revenue"
            textColor="#0077b6"
        >
            <Row gutter={16}>

                {/*Week Transactions amount*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#1e96fc"
                        icon={<BsCashCoin
                            color="#1e96fc"
                            size={32}>
                        </BsCashCoin>}
                        title="Day's Revenue"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.dayTransactionsAmount ?? 0)} TZS`}
                    ></DashboardStatistic>
                </Col>

                {/*Week Transactions amount*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#1e96fc"
                        icon={<BsCashCoin
                            color="#1e96fc"
                            size={32}>
                        </BsCashCoin>}
                        title="Week's Revenue"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.weekTransactionsAmount ?? 0)} Tsh`}
                    ></DashboardStatistic>
                </Col>

                {/*Month transactions amount*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#1e96fc"
                        icon={<BsCashCoin
                            color="#1e96fc"
                            size={32}>
                        </BsCashCoin>}
                        title="Month's Revenue"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.monthTransactionsAmount ?? 0)} Tsh`}
                    ></DashboardStatistic>
                </Col>

                {/*All Transactions Count*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#1e96fc"
                        icon={<BsCashCoin
                            color="#1e96fc"
                            size={32}>
                        </BsCashCoin>}
                        title="All Time Revenue"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.allTimeTransactionsAmount ?? 0)}`}
                    ></DashboardStatistic>
                </Col>

            </Row>
        </StatisticsGroup>


        {/**
         ------------------------
         | SMS Counters
         ------------------------
         */}
        <StatisticsGroup
            title="SMS Counters"
            textColor="#e0b1cb"
        >
            <Row gutter={16}>

                {/*Day SMSes*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#b5838d"
                        icon={<BsEnvelope
                            color="#b5838d"
                            size={32}>
                        </BsEnvelope>}
                        title="Sent Today"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.daySmsCounter ?? 0)} SMS`}
                    ></DashboardStatistic>
                </Col>

                {/*Week SMSes*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#b5838d"
                        icon={<BsEnvelope
                            color="#b5838d"
                            size={32}>
                        </BsEnvelope>}
                        title="Sent This Week"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.weekSmsCounter ?? 0)} SMS`}
                    ></DashboardStatistic>
                </Col>

                {/*Month SMSs*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#b5838d"
                        icon={<BsEnvelope
                            color="#b5838d"
                            size={32}>
                        </BsEnvelope>}
                        title="Sent This Month"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.monthSmsCounter ?? 0)} SMS`}
                    ></DashboardStatistic>
                </Col>

                {/*Month SMSs*/}
                <Col className="gutter-row" span={6}>
                    <DashboardStatistic
                        textColor="#b5838d"
                        icon={<BsEnvelope
                            color="#b5838d"
                            size={32}>
                        </BsEnvelope>}
                        title="Sent - All Time"
                        subTitle={`${new Intl.NumberFormat('en-US').format(stats?.allTimeSmsCounter ?? 0)} SMS`}
                    ></DashboardStatistic>
                </Col>
            </Row>
        </StatisticsGroup>


        {/**
         ------------------------
         | Subscription by code
         ------------------------
         */}
        <StatisticsGroup
            title="Subscribers by Code"
            textColor="#fb8500"
        >
            <Row gutter={16}>

                {subscriptionsByCode.map((team) => {
                    return <Col className="gutter-row" span={3}>
                        <DashboardStatistic
                            textColor="#fb8500"
                            icon={<HiOutlineHashtag
                                color="#fb8500"
                                size={32}>
                            </HiOutlineHashtag>}
                            title={team.reference}
                            subTitle={`${new Intl.NumberFormat('en-US').format(team.subscriptions ?? 0)}`}
                        ></DashboardStatistic>
                    </Col>
                })}

            </Row>
        </StatisticsGroup>


        {/**
         ------------------------
         | Teams Stats
         ------------------------
         */}
        <StatisticsGroup
            title="Subscribers by Team"
            textColor="#457b9d"
        >
            <Row gutter={16}>

                {/*Week Transactions Count*/}
                {teams.map((team) => {
                    return <Col className="gutter-row" span={4}>
                        <DashboardStatistic
                            textColor="#457b9d"
                            icon={<GiSoccerBall
                                color="#457b9d"
                                size={32}>
                            </GiSoccerBall>}
                            title={team.name}
                            subTitle={`${new Intl.NumberFormat('en-US').format(team.subscribersCount ?? 0)}`}
                        ></DashboardStatistic>
                    </Col>
                })}

            </Row>
        </StatisticsGroup>


    </div>;

}

export default DashboardInsights

