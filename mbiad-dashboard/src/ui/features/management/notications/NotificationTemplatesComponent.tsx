import {Button, Form, Input, Modal, Pagination, Space, Spin, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../../assets/images/icons/checked.png"
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../../services/notification/notifications";
import EyasiContentCard from "../../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../../templates/Loading";
import {EditOutlined} from "@ant-design/icons";
import {NotificationTemplate} from "../../../../interfaces/MessagesInterfaces";


const MessagesComponent = () => {

    const columns: ColumnsType<NotificationTemplate> = [
        {
            title: 'S/N',
            dataIndex: 'id',
            render: (_, record) => (<> {record.id} </>),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (_, record) => (<> {record.type} </>),
        },
        {
            title: 'Content',
            dataIndex: 'content',
            render: (_, record) => (<> {record.content} </>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => showEditForm(record)}><EditOutlined style={{marginRight:'0.8em'}}/>Update</a>
                </Space>
            )
        },
        {
            title: 'Updated By',
            dataIndex: 'last_updated_by',
            render: (_, record) => (<> {record.last_updated_by}</>),
        },
        {
            title: 'Last Update',
            dataIndex: 'last_updated_by',
            render: (_, record) => (<> {record.updated_at}  </>),
        }

    ];

    const [notificationTemplate, updateTeamTopicsList] = useState<NotificationTemplate[]>([]);
    const [antdForm] = Form.useForm();
    const [messageModalOpen, setMessageModal] = useState(false)
    const [totalRecords, updateTotalRecords] = useState(0);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    //Fetch products
    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
    }, [notificationTemplate]);

    const fetchRecords = () => {
        console.log("Fetching teams...")
        setIsLoading(true)
        getRequest(`/api/v1/management/templates/notifications`).then((response) => {
            updateTeamTopicsList(response.data.payload.notifications.data);
            updateTotalRecords(response.data.payload.notifications.total);
            updateCurrentPageNo(response.data.payload.notifications.current_page)
            updatePageSize(response.data.payload.notifications.per_page)
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const showEditForm = (record = {}) => {
        setMessageModal(true)
        antdForm.resetFields();
        antdForm.setFieldsValue(record);
    }

    const handleSave = (item: NotificationTemplate) => {
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest(  "/api/v1/management/templates/notifications/update"  , item)
            .then((response) => {
                notifySuccess("Success", "Record Updated")
                fetchRecords();
                setIsLoading(false);
                setMessageModal(false)
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

    return <EyasiContentCard title="Notification Templates"
                             iconImage={sectionIcon}
                             subTitle="One-Time Notifications"
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>
                             ]}>


        {/**---------------------------*
         /** Staff Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={notificationTemplate}
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
         /*  Shipping Category Form
         ***------------------------------*/}
        <Modal title="Notification Templates"
               open={messageModalOpen}
               onOk={() => {
                   antdForm.submit()
               }}
               confirmLoading={isLoading}
               onCancel={() => {
                   setMessageModal(false)
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
                    label="Content"
                    name="content"
                >
                    <Input/>
                </Form.Item>


            </Form>
        </Modal>


    </EyasiContentCard>;

}

export default MessagesComponent

