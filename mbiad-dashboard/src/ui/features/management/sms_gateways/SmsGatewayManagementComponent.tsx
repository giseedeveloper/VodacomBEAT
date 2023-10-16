import {Form, Input, Modal, Pagination, Space, Spin, Switch, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../../assets/images/icons/tower.png"
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../../services/notification/notifications";
import EyasiContentCard from "../../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../../templates/Loading";
import {EditOutlined} from "@ant-design/icons";
import {SmsGateway} from "../../../../interfaces/MessagesInterfaces";


const SmsGatewayManagementComponent = () => {

    const columns: ColumnsType<SmsGateway> = [
        {
            title: 'S/N',
            dataIndex: 'id',
            render: (_, record) => (<> #{record.id} </>),
        },
        {
            title: 'Provider',
            dataIndex: 'provider_name',
            render: (_, record) => (<> {record.provider_name} </>),
        },
        {
            title: 'Sender Id',
            dataIndex: 'sender_id',
            render: (_, record) => (<> {record.sender_id} </>),
        }, {
            title: 'Balance',
            dataIndex: 'balance',
            render: (_, record) => (<> {record.balance} </>),
        },
        {
            title: 'Default',
            dataIndex: 'sender_id',
            render: (_, record) => (<> {record.is_default?
                <Tag color="#2db7f5">Default</Tag> :
                <Tag color="default">Not Used</Tag>} </>),
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

    const [notificationTemplate, updateTeamTopicsList] = useState<SmsGateway[]>([]);
    const [antdForm] = Form.useForm();
    const [messageModalOpen, setMessageModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [isDefault, setIsDefault] = useState(true);

    //Fetch products
    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
    }, [notificationTemplate]);

    const fetchRecords = () => {
        console.log("Fetching records...")
        setIsLoading(true)
        getRequest(`/api/v1/management/sms/gateways`).then((response) => {
            updateTeamTopicsList(response.data.payload.gateways.data);
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const showEditForm = (record = {is_default:false}) => {
        setMessageModal(true)
        antdForm.resetFields();


        setIsDefault(record.is_default)
        antdForm.setFieldsValue(record);
    }

    const handleSave = (item: SmsGateway) => {
        item.is_default = isDefault;
        console.log(JSON.stringify(item))
        setIsLoading(true);
        postRequest(  "/api/v1/management/sms/gateways/update"  , item)
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


    return <EyasiContentCard title="SMS Gateways"
                             iconImage={sectionIcon}
                             subTitle=""
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
                    label="Sender ID"
                    name="sender_id"
                >
                    <Input/>
                </Form.Item>

                <Switch
                    checked={isDefault}
                    checkedChildren="Default"
                    unCheckedChildren="Not Default"
                    onChange={() => {
                        setIsDefault(!isDefault);
                    }}
                />

            </Form>
        </Modal>


    </EyasiContentCard>;

}

export default SmsGatewayManagementComponent

