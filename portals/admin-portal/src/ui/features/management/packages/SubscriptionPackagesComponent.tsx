import {Form, Input, Modal, Pagination, Space, Spin, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../../assets/images/icons/agreement.png"
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../../services/notification/notifications";
import EyasiContentCard from "../../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../../templates/Loading";
import Search from "antd/es/input/Search";
import {EditOutlined, PercentageOutlined} from "@ant-design/icons";
import {SubscriptionPackage} from "../../../../interfaces/subscriptions/SubscriptionsInterfaces";


const SubscriptionPackagesComponent = () => {


    const [referralsList, updateReferralsList] = useState<SubscriptionPackage[]>([]);

    const [totalRecords, updateTotalRecords] = useState(0);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");


    const [antdForm] = Form.useForm();
    const [formModalOpen, setFormModal] = useState(false)


    //Fetch products
    useEffect(() => {
        fetchRecords();
    }, [searchQuery]);

    useEffect(() => {
    }, [referralsList]);

    const fetchRecords = () => {
        console.log("Fetching subscription packages...")
        setIsLoading(true)
        getRequest(`/api/v1/management/config/packages/list`)
            .then((response) => {
            updateReferralsList(response.data.payload.packages.data);
            updateTotalRecords(response.data.payload.packages.total);
            updateCurrentPageNo(response.data.payload.packages.current_page)
            updatePageSize(response.data.payload.packages.per_page)
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

    const handleSave = (item: SubscriptionPackage) => {
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest( "/api/v1/management/config/packages/update", item)
            .then((response) => {
                notifySuccess("Success", "Record Updated")
                setIsLoading(false);
                setFormModal(false)
                fetchRecords();
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



    const columns: ColumnsType<SubscriptionPackage> = [
        {
            title: 'Package',
            dataIndex: 'package',
            render: (_, record) => (<>
                <span style={{fontWeight: 'bold'}}>{record.package}</span>
            </>),
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            render: (_, record) => (<> {record.duration}   </>),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (_, record) => (<>{record.price} </>),
        },
        {
            title: 'Commission Percentage',
            dataIndex: 'commission_percentage',
            render: (_, record) => (<>{record.commission_percentage}%</>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a style={{border:'1px solid blue', padding:'4px 8px'}}
                       onClick={() => showEditForm(record)}><EditOutlined style={{marginRight:'0.8em'}}/>Edit</a>
                </Space>
            )
        }
    ];

    return <EyasiContentCard title="Subscription Packages"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
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
         /*  Package Form
         ***------------------------------*/}
        <Modal title="Subscription Package"
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
                    label="Package"
                    name="package"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Duration"
                    name="duration"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Price"
                    name="price"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Commission Percentage"
                    name="commission_percentage"
                >
                    <Input prefix={<PercentageOutlined/>}/>
                </Form.Item>

            </Form>
        </Modal>




    </EyasiContentCard>;

}

export default SubscriptionPackagesComponent

