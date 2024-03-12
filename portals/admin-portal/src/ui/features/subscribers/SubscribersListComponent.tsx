import {Button, Pagination, Space, Spin, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import {UndoOutlined} from "@ant-design/icons";
import Search from "antd/es/input/Search";
import {notifyHttpError} from "../../../services/notification/notifications";
import {getRequest, postRequest} from "../../../services/rest/RestService";
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../templates/Loading";
import {Subscription} from "../../../interfaces/subscriptions/SubscriptionsInterfaces";
import sectionIcon from "../../../assets/images/icons/subscription.png"

const SubscriptionListComponent = () => {

    const [subscribersList, updateSubscribersList] = useState<Subscription[]>([]);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(15);
    const [totalSubscribers, updateTotalSubscribers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");
    const [activeSubscribers, updateActiveSubscribers] = useState(0);

    //Fetch products
    useEffect(() => {
        fetchSubscribersList();
    }, [currentPageNo, pageSize, searchQuery]);


    const fetchSubscribersList = () => {

        setIsLoading(true);
        const url = `/api/v1/management/subscriptions/list?phone=${searchQuery}&perPage=${pageSize}&page=${currentPageNo}`;
        console.log(`Fetching subscriptions... ${url}`)

        getRequest(url)
            .then((response) => {
                console.log(response.data.payload.subscriptions.data);
                updateSubscribersList(response.data.payload.subscriptions.data);
                updateActiveSubscribers(response.data.payload.activeSubscriptions)
                updateTotalSubscribers(response.data.payload.subscriptions.total);
                updateCurrentPageNo(response.data.payload.subscriptions.current_page);
                setIsLoading(false);
            })
            .catch((errorObj) => {
                notifyHttpError('Operation Failed', errorObj)
            }).finally(() => {
            setIsLoading(false);
        })
    }

    const updateSubscription = (subscription:Subscription) => {

        const url:string = `/api/v1/subscriptions/update`;
        console.log(`Updating subscriptions... ${url}`)

        setIsLoading(true);
        postRequest(url,{
            "id" :subscription.id,
            "include" : !(subscription.include)
        })
            .then((response) => {
                console.log(response.data.payload);
                setIsLoading(false);
                fetchSubscribersList();
            })
            .catch((errorObj) => {
                notifyHttpError('Operation Failed', errorObj)
            }).finally(() => {
            setIsLoading(false);
        })
    }

    const onPageChange = (page: number, pageSize: number) => {
        updateCurrentPageNo(page)
    }
    const onPageSizeChange = (current: number, size: number) => {
        updatePageSize(size)
    }

    const onSearch = (value: string) => {
        updateSearchQuery(value)
    }

    const columns: ColumnsType<Subscription> = [
        {
            title: 'Business',
            dataIndex: 'business_name',
            key: 'business_name',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        {record.business_name} <br/>
                    </Space>
                </>
            ),
        },
        {
            title: 'Contacts',
            dataIndex: 'business_name',
            key: 'business_name',
            render: (_, record) => (
                <>
                    {record.contact_person_name} <br/>
                    {record.contact_phone} <br/>
                </>
            ),
        },
        {
            title: 'Paid Amount',
            dataIndex: 'topic_code',
            key: 'topic_code',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        <Tag color="processing">{record.amount}</Tag>
                    </Space>
                </>
            ),
        },
        {
            title: 'Package',
            dataIndex: 'topic_code',
            key: 'topic_code',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        <Tag color="processing">{record?.package?.duration}</Tag>
                    </Space>
                </>
            ),
        },
        {
            title: 'Starts at',
            dataIndex: 'starts_at',
            key: 'starts_at',
            render: (_, record) => (
                <>
                    Starts: {record.starts_at}<br/>
                    Ends: {record.expires_at}
                </>
            )
        },
        {
            title: 'Commissions',
            dataIndex: 'commission',
            key: 'reference',
            render: (_, record) => (
                <>
                    {record.commission_amount} TZS
                </>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" >  View </Button>
                </Space>
            ),
        },
    ];

    return <EyasiContentCard title="Subscriptions"
                             subTitle="history"
                             iconImage={sectionIcon}
                             extraHeaderItems={[
                                 isLoading && <Spin indicator={customerLoadingIcon}></Spin>,
                                 <Button style={{marginRight: 16}} icon={<UndoOutlined/>} onClick={fetchSubscribersList} key="2"
                                         type="default">Refresh</Button>,
                                 //  <Button href="/products/instance/new" key="1" type="primary">Add Order</Button>
                             ]}>

        {/**---------------*
         /** Search
         *----------------*/}
        <Space style={{marginBottom: 24}} direction="vertical" size="middle">
            <Space.Compact>
                <Search placeholder="Search Subscribers"
                        onSearch={onSearch}
                        allowClear/>

                <h3 style={{ width: "420px", marginTop:0, paddingTop:0, marginLeft:24 }}>
                    Total Active Subscribers: {activeSubscribers}
                </h3>
            </Space.Compact>
        </Space>


        {/**---------------------------*
         /** Orders Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={subscribersList}
            pagination={false}
            loading={isLoading}
            rowKey="id"
        />

        {/**---------------------------*
         /** Pagination
         *-----------------------------*/}
        <Pagination style={{marginTop: 32, marginBottom: 32}}
                    pageSize={pageSize}
                    current={currentPageNo}
                    total={totalSubscribers}
                    simple={false}
                    showSizeChanger={true}
                    onChange={onPageChange}
                    showQuickJumper={true}
                    onShowSizeChange={onPageSizeChange}
        />

    </EyasiContentCard>;

}

export default SubscriptionListComponent

