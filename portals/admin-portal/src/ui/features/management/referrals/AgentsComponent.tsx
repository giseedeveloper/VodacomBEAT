import {Button, Form, Input, Modal, Pagination, Select, Space, Spin, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../../assets/images/icons/agreement.png"
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../../services/notification/notifications";
import EyasiContentCard from "../../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../../templates/Loading";
import {ReferralAgent,MobileNetwork} from "../../../../interfaces/referrals/ReferralsInterfaces";
import Search from "antd/es/input/Search";
import {EditOutlined, ReloadOutlined} from "@ant-design/icons";



const MessagesComponent = () => {


    const [referralsList, updateReferralsList] = useState<ReferralAgent[]>([]);
    const [mobileNetwork, updateFspList] = useState<MobileNetwork[]>([]);

    const [totalRecords, updateTotalRecords] = useState(0);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");


    const [antdForm] = Form.useForm();
    const [formModalOpen, setFormModal] = useState(false)

    const [passwordAntdForm] = Form.useForm();
    const [passwordModalOpen, togglePasswordModal] = useState(false)


    //Fetch products
    useEffect(() => {
        fetchFsp();
        fetchRecords();
    }, [searchQuery]);

    useEffect(() => {
    }, [referralsList]);

    const fetchRecords = () => {
        console.log("Fetching referrals...")
        setIsLoading(true)
        getRequest(`/api/v1/referrals?query=${searchQuery}`).then((response) => {
            updateReferralsList(response.data.payload.referrals.data);
            updateTotalRecords(response.data.payload.referrals.total);
            updateCurrentPageNo(response.data.payload.referrals.current_page)
            updatePageSize(response.data.payload.referrals.per_page)
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const fetchFsp = () => {
        console.log("Fetching FSPs...")
        setIsLoading(true)
        getRequest(`/api/v1/resources/fsp/list`).then((response) => {
            updateFspList(response.data.payload.fsps)
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const showEditForm = (record = {}) => {
        setFormModal(true)
        antdForm.resetFields();
        antdForm.setFieldsValue(record);
    }

    const openPasswordForm = (record = {}) => {
        togglePasswordModal(true)
        passwordAntdForm.resetFields();
        passwordAntdForm.setFieldsValue(record);
    }

    const handleSave = (item: ReferralAgent) => {
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest(item.id? "/api/v1/referrals/update" : "/api/v1/referrals/create", item)
            .then((response) => {
                notifySuccess("Success", "Referral Agent Added")
                setIsLoading(false);
                setFormModal(false)
                fetchRecords();

            }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
            setIsLoading(false);
        })
    }

    const resetPassword = (item: ReferralAgent) => {
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest("/api/v1/referrals/password/reset", item)
            .then((response) => {
                setIsLoading(false);
                notifySuccess("Success", "Psasword updated")
                togglePasswordModal(false)
            }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
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



    const columns: ColumnsType<ReferralAgent> = [
        {
            title: 'Name',
            dataIndex: 'first_name',
            render: (_, record) => (<> {record.first_name} {record.second_name} </>),
        },
        {
            title: 'Payment Channel',
            dataIndex: 'network',
            render: (_, record) => (<>  {record.phone_number}
                <br/> <Tag style={{fontWeight: 'bold'}} color="blue">{record.network?.name}</Tag> </>),
        },
        {
            title: 'Commission Ref.',
            dataIndex: 'reference_number',
            render: (_, record) => (<> {record.reference_number} </>),
        },
        {
            title: 'Sales Zone',
            dataIndex: 'sales_zone',
            render: (_, record) => (<> {record.sales_zone} </>),
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
                    <a onClick={() => showEditForm(record)}><EditOutlined style={{marginRight:'0.8em'}}/>Edit</a>
                    <a style={{color:'red'}} onClick={() => openPasswordForm(record)}><ReloadOutlined style={{marginRight:'0.8em', color:'red'}}/>Reset</a>
                </Space>
            )
        }
    ];



    return <EyasiContentCard title="Referrals Agents"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
                                 <Button key="addStaffButton" type="primary" onClick={showEditForm} ghost>Create
                                     Agent</Button>
                             ]}>

        {/**---------------*
         /** Search
         *----------------*/}
        <Space style={{marginBottom: 24}} direction="vertical" size="middle">
            <Space.Compact>
                <Search placeholder="Search Subscribers"
                        onSearch={onSearch}
                        allowClear/>

                {/*<h3 style={{ width: "420px", marginTop:0, paddingTop:0, marginLeft:24 }}>*/}
                {/*    Total Active Subscribers: {activeSubscribers}*/}
                {/*</h3>*/}
            </Space.Compact>
        </Space>

        {/**---------------------------*
         /** Staff Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={referralsList}
            loading={isLoading}
            rowKey="id"
        />

        {/**---------------------------*
         /** Pagination
         *-----------------------------*/}
        <Pagination style={{marginTop: 32, marginBottom: 32}}
                    pageSize={pageSize}
                    current={currentPageNo}
                    total={totalRecords}
                    simple={false}
                    showSizeChanger={true}
                    onChange={onPageChange}
                    showQuickJumper={true}
                    onShowSizeChange={onPageSizeChange}
        />


        {/***------------------------------
         /*  Agent Creation
         ***------------------------------*/}
        <Modal title="Referral Agent"
               open={formModalOpen}
               onOk={() => {
                   antdForm.submit()
               }}
               confirmLoading={isLoading}
               onCancel={() => {
                   setFormModal(false)
               }}>

            <Form
                form={antdForm}
                layout="vertical"
                onFinish={handleSave}
            >

                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="First Name"
                    name="first_name"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Last Name"
                    name="second_name"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Phone Number"
                    name="phone_number"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Mobile Network"
                    name="mobile_network_id"
                >
                    <Select
                        style={{width: '100%'}}
                        options={mobileNetwork.map((fsp) => ({label: fsp.name, value: fsp.id}))}
                    />
                </Form.Item>

                <Form.Item
                    label="Sales Zone"
                    name="sales_zone"
                >
                    <Input/>
                </Form.Item>

            </Form>
        </Modal>


        {/***------------------------------
         /*  Password reset
         ***------------------------------*/}
        <Modal title="Update Password"
               open={passwordModalOpen}
               onOk={() => {
                   passwordAntdForm.submit()
               }}
               confirmLoading={isLoading}
               onCancel={() => {
                   togglePasswordModal(false)
               }}>

            <Form
                form={passwordAntdForm}
                layout="vertical"
                onFinish={resetPassword}
            >

                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="New Password"
                    name="password"
                >
                    <Input/>
                </Form.Item>


            </Form>
        </Modal>


    </EyasiContentCard>;

}

export default MessagesComponent

