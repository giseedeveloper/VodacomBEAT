import React, {useState, useEffect, CSSProperties} from 'react';
import {getRequest, postRequest} from "../../../../services/rest/RestService";
import {notifyHttpError} from "../../../../services/notification/notifications";
import {Button, Col, Divider, Form, List, Row, Space, Tag} from "antd";
import {
    AlertOutlined,
    CheckOutlined, ExclamationCircleOutlined, ExclamationOutlined, EyeOutlined, HomeOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {HiUserGroup} from "react-icons/hi";
import {isNotEmpty} from "../../../../utils/helpers";

interface TuneSubscription {
    "id": string,
    "subscription_reference": string,
    "customer_id": string,
    "contact_phone": string,
    "contact_person_name": string,
    "business_name": string,
    "payment_phone": string,
    "amount": string,
    "commission_amount": string,
    "starts_at": string,
    "created_at": string,
    "phones": TunePhone[]
}

interface TunePhone {
    "phone_number": string
}

const infoTitleStyle : CSSProperties = {
    borderBottom: '1px dashed #d1d1d1',
    padding: '6px'
};

const infoStyle : CSSProperties = {
    color: 'darkblue',
    textAlign: 'right',
    borderBottom: '1px dashed #d1d1d1',
    padding: '6px'
};


const AgentCustomers = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [agentSubscribers, setSubscribers] = useState<TuneSubscription[]>([]);
    const navigate = useNavigate();

    //Fetch products
    useEffect(() => {
        fetchSubscribers();
    }, []);

    //Fetch Stats
    const fetchSubscribers = () => {
        console.log("Fetching stats...")
        setIsLoading(true)
        getRequest("/api/v1/tunes/agent/subscription/get").then((response) => {
            setSubscribers(response.data.payload.subscriptions.data);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const retryPayment = (tuneSubscription: TuneSubscription) => {
        console.log(JSON.stringify(tuneSubscription))
        setIsLoading(true);
        postRequest("/api/v1/tunes/agent/subscription/retry", {
            "subscription_id": tuneSubscription.id
        })
            .then((response) => {
                setIsLoading(false)
                fetchSubscribers();
            }).catch((errorObj) => {

            setIsLoading(false)
            notifyHttpError('Operation Failed', errorObj)

        }).finally(() => {
            setIsLoading(false)
        })
    }

    return <div style={{
        paddingLeft: '0px',
        paddingRight: '0px',
        marginTop: "24px",
        marginBottom: "64px",
    }}>

        <Space>
            <h2 style={{color: "#E60000", paddingLeft: '16px'}}>My Customers</h2>
        </Space>



        <List
            itemLayout="vertical"
            size="large"
            dataSource={agentSubscribers}
            rowKey="id"
            style={{backgroundColor: '#fffff'}}
            footer={
                <div style={{
                    textAlign: 'center',
                    marginTop: 12,
                    height: 32,
                    lineHeight: '32px',
                }}>
                    {/*<Button onClick={fetchSubscribers}>Load more</Button>*/}
                </div>
            }
            renderItem={(subscription) => {

                const activated = isNotEmpty(subscription.starts_at);

                // -------------
                // List Item
                // -----------

                return <List.Item
                    key={subscription.id}
                    style={{backgroundColor: '#ffffff',borderBottom: '1px solid red'}}
                    actions={[
                        <Space>
                            {activated ? <div></div> : <Button onClick={() => {retryPayment(subscription) }}
                                                               icon={<ReloadOutlined/>} key="1"
                                                               loading={isLoading}
                                                               title={`Retry Payment`}>Retry Payment</Button>}

                            <Button target="_blank"
                                    href={`http://subscriptions.mobiadafrica.com/subscriptions/${subscription.subscription_reference}`}
                                    icon={<EyeOutlined/>}
                                    key="2"
                                    title={`Retry Payment`}>View Full</Button>
                        </Space>
                    ]}
                >

                    {/*List Content*/}
                    <div>

                        <Row>
                            <Col span={18}>
                                <h3 style={{margin:"0", padding:"0"}}>{subscription.business_name}</h3>
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <Tag
                                    icon={activated ? <CheckOutlined/> : <ExclamationCircleOutlined/>}
                                    color={activated ? `green` : `#ffb703`}
                                    key="list-vertical-message"><span
                                    style={{fontWeight: 'bold'}}>{activated ? 'COMPLETE' : 'PENDING'}</span></Tag>
                            </Col>
                        </Row>

                        <Space>



                        </Space>

                        <table style={{width:"100%"}}>
                            <tbody>
                            <tr key="1">
                                <td style={infoTitleStyle}>Payment Phone</td>
                                <td style={infoStyle}>{subscription.payment_phone}</td>
                            </tr>
                            <tr key="2">
                                <td style={infoTitleStyle}>Package</td>
                                <td style={infoStyle}> {subscription.amount} TZS</td>
                            </tr>
                            <tr key="2">
                                <td style={infoTitleStyle}>Commission</td>
                                <td style={infoStyle}> {subscription.commission_amount} TZS</td>
                            </tr>
                            <tr key="2">
                                <td style={infoTitleStyle}>Date</td>
                                <td style={infoStyle}> {subscription.created_at}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                </List.Item>
            }}
        />
    </div>;

}

export default AgentCustomers

