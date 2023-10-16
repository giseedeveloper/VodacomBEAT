import {Button, Form, Input, Modal, Pagination, Space, Spin, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../../assets/images/icons/topic.png"
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../../services/notification/notifications";
import EyasiContentCard from "../../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../../templates/Loading";
import {EditOutlined} from "@ant-design/icons";
import {TeamTopic} from "../../../../interfaces/MessagesInterfaces";
import {is} from "cheerio/lib/api/traversing";


const MessagesComponent = () => {

    const columns: ColumnsType<TeamTopic> = [
        {
            title: 'S/N',
            dataIndex: 'name',
            render: (_, record) => (<> {record.id} </>),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_, record) => (<> {record.name} </>),
        },        {
            title: 'Code',
            dataIndex: 'code',
            render: (_, record) => (<> {record.code} </>),
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
                </Space>
            )
        }
    ];

    const [referralsList, updateTeamTopicsList] = useState<TeamTopic[]>([]);
    const [antdForm] = Form.useForm();
    const [messageModalOpen, setMessageModal] = useState(false)
    const [totalRecords, updateTotalRecords] = useState(0);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");

    //Fetch products
    useEffect(() => {
        fetchRecords();
    }, [searchQuery]);

    useEffect(() => {
    }, [referralsList]);

    const fetchRecords = () => {
        console.log("Fetching teams...")
        setIsLoading(true)
        getRequest(`/api/v1/topics?query=${searchQuery}`).then((response) => {
            updateTeamTopicsList(response.data.payload.topics.data);
            updateTotalRecords(response.data.payload.topics.total);
            updateCurrentPageNo(response.data.payload.topics.current_page)
            updatePageSize(response.data.payload.topics.per_page)
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

    const handleSave = (item: TeamTopic) => {
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest(item.id? "/api/v1/topics/update" : "/api/v1/topics/create", item)
            .then((response) => {
                notifySuccess("Success", "Topic Added")
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

    const onSearch = (value: string) => {
        updateSearchQuery(value)
    }

    return <EyasiContentCard title="Teams/Topics"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
                                 <Button key="addStaffButton" type="primary" onClick={showEditForm} ghost>Add
                                     Team</Button>
                             ]}>


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
         /*  Shipping Category Form
         ***------------------------------*/}
        <Modal title="Team"
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
                    label="Team Name"
                    name="name"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Unique Code"
                    name="code"
                >
                    <Input/>
                </Form.Item>

            </Form>
        </Modal>


    </EyasiContentCard>;

}

export default MessagesComponent

