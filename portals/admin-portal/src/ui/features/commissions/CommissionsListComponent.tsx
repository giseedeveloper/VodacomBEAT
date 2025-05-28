import {
    Badge,
    Button,
    DatePicker,
    Form,
    Input, List,
    Modal,
    Pagination,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    TimePicker
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import {EditOutlined, EyeOutlined, MessageOutlined, UndoOutlined} from "@ant-design/icons";
import Search from "antd/es/input/Search";
import {notifyHttpError} from "../../../services/notification/notifications";
import {getRequest, postRequest} from "../../../http/RestService";
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../templates/Loading";
import {Subscription} from "../../../interfaces/subscriptions/SubscriptionsInterfaces";
import sectionIcon from "../../../assets/images/icons/people.png"
import {CommissionedReferralAgent} from "../../../interfaces/referrals/ReferralsInterfaces";
import TextArea from "antd/es/input/TextArea";
import Compact from "antd/es/space/Compact";

const CommissionsListComponent = () => {

    const [agentsList, updateAgentsList] = useState<CommissionedReferralAgent[]>([]);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(15);
    const [totalAgents, updateTotalAgents] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");
    const [activeSubscribers, updateActiveSubscribers] = useState(0);
    const [selectedAgent, setSelectedAgent] = useState<CommissionedReferralAgent>();

    //Fetch products
    useEffect(() => {
        fetchCommissionsList();
    }, [currentPageNo, pageSize, searchQuery]);


    const fetchCommissionsList = () => {

        setIsLoading(true);
        const url = `/api/v1/commissions?paid_commissions=0&phone=${searchQuery}&perPage=${pageSize}&page=${currentPageNo}`;
        console.log(`Fetching agents... ${url}`)

        getRequest(url)
            .then((response) => {
                console.log(response.data.payload.commissions.data);
                updateAgentsList(response.data.payload.commissions.data);
                updateActiveSubscribers(response.data.payload.activeSubscriptions)
                updateTotalAgents(response.data.payload.commissions.total);
                updateCurrentPageNo(response.data.payload.commissions.current_page);
                setIsLoading(false);
            })
            .catch((errorObj) => {
                notifyHttpError('Operation Failed', errorObj)
            }).finally(() => {
            setIsLoading(false);
        })
    }


    const showBreakdown = (agent:CommissionedReferralAgent) => {
        setSelectedAgent(agent);
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
                fetchCommissionsList();
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

    const columns: ColumnsType<CommissionedReferralAgent> = [
        {
            title: 'Agent Name',
            dataIndex: 'first_name',
            render: (_, record) => (<> {record.first_name} {record.second_name}</>),
        },
        {
            title: 'Phone',
            dataIndex: 'phone_number',
            render: (_, record) => (<> {record.phone_number} </>),
        },
        {
            title: 'Commission (TZS)',
            dataIndex: 'commissions_sum_amount',
            render: (_, record) => (<> {record.commissions_sum_amount} </>),
        },
        {
            title: 'Subscribers',
            dataIndex: 'commissions_count',
            render: (_, record) => (<> {record.commissions_count} </>),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            render: (_, record) => (<> {record.created_at} </>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => showBreakdown(record)}><EyeOutlined style={{marginRight:'0.8em'}}/>View</a>
                </Space>
            )
        },

    ];

    return <EyasiContentCard title="Commissions"
                             subTitle="refferals"
                             iconImage={sectionIcon}
                             extraHeaderItems={[
                                 isLoading && <Spin indicator={customerLoadingIcon}></Spin>,
                                 <Button style={{marginRight: 16}} icon={<UndoOutlined/>} onClick={fetchCommissionsList} key="2"
                                         type="default">Refresh</Button>,
                                 //  <Button href="/products/instance/new" key="1" type="primary">Add Order</Button>
                             ]}>

        {/**---------------*
         /** Search
         *----------------*/}
        <Space style={{marginBottom: 24}} direction="vertical" size="middle">
            <Space.Compact>
                <Search placeholder="Search Agents"
                        onSearch={onSearch}
                        allowClear/>

                {/*<h3 style={{ width: "420px", marginTop:0, paddingTop:0, marginLeft:24 }}>*/}
                {/*    <span style={{fontWeight: 'lighter'}}>Commissions Owed:</span> {activeSubscribers} TZS*/}
                {/*</h3>*/}
            </Space.Compact>
        </Space>


        {/**---------------------------*
         /** Orders Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={agentsList}
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
                    total={totalAgents}
                    simple={false}
                    showSizeChanger={true}
                    onChange={onPageChange}
                    showQuickJumper={true}
                    onShowSizeChange={onPageSizeChange}
        />


        {/***------------------------------
         /*  Shipping Category Form
         ***------------------------------*/}
        <Modal title={`${selectedAgent?.first_name} ${selectedAgent?.second_name} Subscribers`}
               open={selectedAgent!=null}
               onCancel={() => {
                   setSelectedAgent(undefined);
               }}
               onOk={() => {
                   setSelectedAgent(undefined);
               }}
               cancelButtonProps={{ style: { display: 'none' } }}
               confirmLoading={isLoading}>

            <List
                itemLayout="horizontal"
                dataSource={selectedAgent?.commissions}
                renderItem={(commission, index) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<a href="#">{`${commission.subscription?.phone_number} ${commission.amount}TZS`}</a>}
                            description={`${commission.subscription?.starts_at} - ${commission.subscription?.expires_at}  (${commission.percentage}%)`}
                        />
                    </List.Item>
                )}
            />
        </Modal>


    </EyasiContentCard>;

}

export default CommissionsListComponent

