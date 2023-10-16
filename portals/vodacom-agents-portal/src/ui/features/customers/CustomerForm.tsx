import React, {useState, useEffect} from 'react';
import {getRequest, postRequest} from "../../../services/rest/RestService";
import {notifyHttpError} from "../../../services/notification/notifications";
import {Button, Form, Input, Radio, Space} from "antd";
import TextArea from "antd/es/input/TextArea";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

interface Stats {
    "weekTransactionsCount": number,
    "weekTransactionsAmount": number,
    "monthTransactionsAmount": number,
    "daySubscriptionsCount": number,
    "activeSubscriptions": number
}

const CustomerForm = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [customerForm] = Form.useForm();
    const navigate = useNavigate();

    const handleCustomerSave = (subscriptionInformation: any) => {

        subscriptionInformation.subscription_phones = subscriptionInformation.selectedPhones.map((phoneInstance: any) => {
            return phoneInstance.phoneNumber;
        });

        console.log(JSON.stringify(subscriptionInformation))
        setIsLoading(true);
        postRequest("/api/v1/tunes/agent/subscription/add", subscriptionInformation)
            .then((response) => {
                setIsLoading(false)
                navigate("/");

            }).catch((errorObj) => {

            setIsLoading(false)
            notifyHttpError('Operation Failed', errorObj)

        }).finally(() => {
            setIsLoading(false)
        })
    }

    return <div style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        marginTop: "24px",
        marginBottom: "64px",
    }}>


        <Form
            form={customerForm}
            layout="vertical"
            onFinish={handleCustomerSave}>

            {/*Contact Person Name*/}
            <Form.Item
                name="contact_person_name"
                label="Contact Person Name">
                <Input type="text"/>
            </Form.Item>

            {/*Contact Person Phone*/}
            <Form.Item
                name="contact_phone"
                label="Contact Person Phone">
                <Input type="text"/>
            </Form.Item>

            {/*Business Name*/}
            <Form.Item
                name="business_name"
                label="Business Name">
                <Input type="text"/>
            </Form.Item>


            {/*Voice Type*/}
            <Form.Item label="Voice Type"
                       name="voice_type">
                <Radio.Group>
                    <Radio.Button value="MALE">Male</Radio.Button>
                    <Radio.Button value="FEMALE">FEMALE</Radio.Button>
                </Radio.Group>
            </Form.Item>

            {/*Voice Script*/}
            <Form.Item
                label="Voice Script"
                name="voice_script">
                <TextArea rows={4}/>
            </Form.Item>

            {/*Service Phone Number*/}
            <h3 style={{marginTop: '48px', color: "#E60000"}}>Phones To Activate</h3>


            <Form.List name="selectedPhones">
                {(fields, {add, remove}) => (
                    <>
                        {fields.map(({key, name, ...restField}) => (
                            <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                                <Form.Item
                                    {...restField}
                                    name={[name, 'phoneNumber']}
                                    rules={[{required: true, message: 'Phone Required'}]}
                                >
                                    <Input placeholder="2557XXYYYZZZ"/>
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)}/>
                            </Space>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                Add Phone
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>


            <h3 style={{marginTop: '64px', color: "#E60000"}}>Payment Information</h3>
            <Form.Item
                name="payment_phone"
                label="Payment Phone Number">
                <Input type="text"/>
            </Form.Item>

            <Form.Item
                label="Package"
                name="subscription_package">
                <Radio.Group onChange={() => {
                }}>
                    <Space direction="vertical">
                        <Radio value={1}>1 Month</Radio>
                        <Radio value={3}>3 Months</Radio>
                        <Radio value={6}>6 Months</Radio>
                        <Radio value={12}>12 Months</Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>


            <Form.Item wrapperCol={{span: 24}} style={{marginBottom: '240px'}}>
                <Button loading={isLoading} block style={{backgroundColor: '#E60000'}} type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>

        </Form>


    </div>;

}

export default CustomerForm

