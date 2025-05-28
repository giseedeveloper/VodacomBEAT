import {Avatar, Button, DatePicker, Form, Image, Input, Modal, Select, Space, Spin, Table, Tag, TimePicker} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../assets/images/icons/label.png"
import {getRequest, postRequest} from "../../../http/RestService";
import {notifyHttpError, notifySuccess} from "../../../services/notification/notifications";
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../templates/Loading";
import {BroadcastMessage, TeamTopic} from "../../../interfaces/MessagesInterfaces";
import TextArea from "antd/es/input/TextArea";
import {CalendarOutlined, ClockCircleOutlined} from "@ant-design/icons";
import {isEmpty, isNotEmpty} from "../../../utils/helpers";
import Compact from "antd/es/space/Compact";


const MessagesTemplatesComponent = () => {


    const columns: ColumnsType<BroadcastMessage> = [
        {
            title: 'S/N',
            dataIndex: 'id',
            render: (_, record) => (<> {record.id}</>),
        },
        {
            title: 'Team/Topic',
            dataIndex: 'topic_code',
            render: (_, record) => (<> {record.topic_code}</>),
        },
        {
            title: 'Message Content',
            dataIndex: 'content',
            render: (_, record) => (<> <p style={{width: '280px'}}>{record.content}</p> </>),
        }, {
            title: 'Eq. SMS',
            dataIndex: 'equivalent_sms_count',
            render: (_, record) => (<> {record.equivalent_sms_count} </>),
        },
        {
            title: 'Status',
            dataIndex: 'created_at',
            render: (_, record) => (<> {isNotEmpty(record.sent_at)? <Tag color="#008000"> Sent: {record.sent_at}</Tag> :
                <Tag><ClockCircleOutlined/> Pending</Tag>} </>),
        },
        {
            title: 'Scheduled',
            dataIndex: 'created_at',
            render: (_, record) => (<> {isNotEmpty(record.send_at)? `${record.send_at}` :'Not Schedule'} </>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<CalendarOutlined style={{marginRight: "6px"}}/>} onClick={() => showMessageForm(record)}
                            type="primary">Configure</Button>
                </Space>
            ),
        }

    ];

    const [messagesList, updateMessageList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [messageForm] = Form.useForm();
    const [messageModalOpen, setMessageModal] = useState(false)
    const [topics, updateTeamTopicsList] = useState<TeamTopic[]>([]);
    const [selectedTopic, setSecondCity] = useState<TeamTopic>();

    //Fetch products
    useEffect(() => {
        fetchMessages();
        fetchTopics();
    }, []);

    useEffect(() => {
    }, [messagesList]);

    const fetchMessages = () => {
        console.log("Fetching messages...")
        setIsLoading(true)
        getRequest("/api/v1/messages").then((response) => {
            updateMessageList(response.data.payload.messages.data);
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const fetchTopics = () => {
        console.log("Fetching teams...")
        setIsLoading(true)
        getRequest(`/api/v1/topics`).then((response) => {
            updateTeamTopicsList(response.data.payload.topics.data);
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const showMessageForm = (message = {}) => {
        setMessageModal(true)
        messageForm.resetFields();
        messageForm.setFieldsValue(message);
    }

    const handleMessageSave = (message: BroadcastMessage) => {
        console.log(JSON.stringify(message))
        setIsLoading(true);
        postRequest(message.id ? "/api/v1/messages/update" : "/api/v1/messages/add", message)
            .then((response) => {
                notifySuccess("Success", "Message Saved")
                fetchMessages();
                setIsLoading(false);
                setMessageModal(false)
            }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
            setIsLoading(false);
        })
    }

    const onSecondCityChange = (value: TeamTopic) => {
        setSecondCity(value);
    };

    return <EyasiContentCard title="Message"
                             iconImage={sectionIcon}
                             subTitle="Broadcasts"
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
                                 <Button key="addStaffButton" type="primary" onClick={showMessageForm} ghost>Create
                                     Message</Button>
                             ]}>

        {/**---------------------------*
         /** Staff Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={messagesList}
            loading={isLoading}
            rowKey="id"
        />


        {/***------------------------------
         /*  Shipping Category Form
         ***------------------------------*/}
        <Modal title="Message"
               open={messageModalOpen}
               onOk={() => {
                   messageForm.submit()
               }}
               confirmLoading={isLoading}
               onCancel={() => {
                   setMessageModal(false)
               }}>

            <Form
                form={messageForm}
                layout="vertical"
                onFinish={handleMessageSave}
            >

                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Topic/Team"
                    name="topic_code"
                >
                    <Select
                        value={selectedTopic}
                        onChange={onSecondCityChange}
                        style={{width: '100%'}}
                        options={topics.map((topic) => ({label: topic.name, value: topic.code}))}
                    />
                </Form.Item>

                <Form.Item
                    style={{marginBottom: 48}}
                    label="Message Content"
                    name="content"
                >
                    <TextArea showCount/>
                </Form.Item>


                <Compact>
                    <Form.Item
                        name="send_at_date"
                        label="Send On (Date)">
                        <DatePicker />
                    </Form.Item>

                    <Form.Item
                        name="send_at_time"
                        label="Send At (Time)">
                        <TimePicker/>
                    </Form.Item>
                </Compact>

            </Form>
        </Modal>


    </EyasiContentCard>;

}

export default MessagesTemplatesComponent

