import React, {useState, useEffect} from 'react';
import {getRequest, postRequest} from "../../http/RestService";
import {notifyHttpError} from "../../services/notification/notifications";
import {Button, Card, Checkbox, Col, Form, Image, Input, Radio, RadioChangeEvent, Row, Space} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
    GiftOutlined,
    MinusCircleOutlined,
    MobileOutlined,
    PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router-dom";
import {isEmpty} from "../../utils/helpers";
import sectionIcon from "../../assets/images/mobiad.png";
import callIcon from "../../assets/images/icons/call.png";

interface Stats {
    "weekTransactionsCount": number,
    "weekTransactionsAmount": number,
    "monthTransactionsAmount": number,
    "daySubscriptionsCount": number,
    "activeSubscriptions": number
}

interface TunePackage {
    package: string,
    price: number,
    duration: number,
}

interface PhoneNumber {
    phoneNumber: string
}

interface TuneSubscription {
    id: string,
    subscription_reference: string
}

const SubscriptionForm = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [packagesList, setPackages] = useState<TunePackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<TunePackage>();
    const [selectedPhones, setSelectedPhones] = useState<PhoneNumber[]>([]);

    const [customerForm] = Form.useForm();

    const navigate = useNavigate();

    //Fetch products
    useEffect(() => {
        fetchPackages();
        fetchStats();
    }, []);

    //Fetch Stats
    const fetchStats = () => {
    }

    //Fetch Packages
    const fetchPackages = () => {
        console.log("Fetching packages...")
        setIsLoading(true)
        getRequest("/api/v1/tunes/customer/packages").then((response) => {
            setIsLoading(false)
            console.log(JSON.stringify(response.data.payload.subscription));
            setPackages(response.data.payload.packages)
        }).catch((errorObj) => {
            setIsLoading(false)
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const handleCustomerSave = (subscriptionInformation: any) => {

        if(isEmpty(subscriptionInformation.selectedPhones)){
            notifyHttpError('Enter phone numbers', {})
            return ;
        }

        subscriptionInformation.subscription_phones = subscriptionInformation.selectedPhones.map((phoneInstance: any) => {
            return phoneInstance.phoneNumber;
        });

        console.log(JSON.stringify(subscriptionInformation))
        setIsLoading(true);
        postRequest("/api/v1/tunes/customer/subscription/add", subscriptionInformation)
            .then((response) => {
                const subscription: TuneSubscription = response.data.payload.subscription;
                setIsLoading(false);
                navigate(`/subscriptions/${subscription.subscription_reference}`);
            }).catch((errorObj) => {
            setIsLoading(false);
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const onValueChange = (changedValues: any, allValues: any) => {
        console.log(JSON.stringify(changedValues.selectedPhones))
        console.log(JSON.stringify(allValues))
        onPhonesChange(changedValues);
    }

    const onPackageSelection = (radioChangeEvent: RadioChangeEvent) => {
        console.log(JSON.stringify(radioChangeEvent.target.value))
        const pickedPackage = packagesList.find(item => {
            return item.package == radioChangeEvent.target.value;
        });

        console.log(`pickedPackage ${JSON.stringify(pickedPackage)}`)
        if (pickedPackage) {
            setSelectedPackage(pickedPackage)
        }
    }

    const onPhonesChange = (changedValues: any) => {
        if (changedValues.selectedPhones != undefined) {
            console.log(`changedValues.selectedPhones -- ${changedValues.selectedPhones}`)
            setSelectedPhones(changedValues.selectedPhones)
        } else {
            console.log(`No changedPhones --  ${changedValues}`)
        }
    }

    const calculateTotal = () => {
        if (isEmpty(selectedPackage)) {
            return "Select Package!"
        }

        if (selectedPhones.length === 0) {
            return "Add at least 1 phone number!"
        }

        return (selectedPackage?.price ?? 0) * (selectedPhones.length);


    }

    return <div className="container" style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        marginTop: "24px",
        marginBottom: "64px",
        backgroundColor: "#ffffff"
    }}>

        <Form
            form={customerForm}
            layout="vertical"
            onValuesChange={onValueChange}
            onFinish={handleCustomerSave}>

            <Row gutter={16} justify="center">


                {/***--------------
                 /* Left column
                 *---------------***/}
                <Col className="gutter-row" sm={24} md={24} lg={12} style={{marginTop: '2em'}}>


                        <Space className="container" align="center" style={{marginBottom: '16px'}}>
                            <Image preview={false} width={96} height={96} src={callIcon}
                                   style={{
                                       marginTop: '2px',
                                       marginLeft: '8px'
                                   }}></Image>
                            <p style={{fontSize: '1.4em', paddingLeft: '24px'}}>
                                Tangaza biashara yako kwa njia ya muito wa simu kila unapopigiwa
                            </p>
                        </Space>


                    {/****---------------------
                     * Primary Information
                     -------------------------*/}
                    <Card bodyStyle={{backgroundColor: '#f9f9f9'}}>

                        <h2 style={{marginTop: '4px', color: "#E60000"}}>
                            <UserOutlined style={{marginRight: '0.5em'}}></UserOutlined>
                            Primary Information
                        </h2>

                        {/*Contact Person Name*/}
                        <Form.Item
                            name="contact_person_name"
                            label={<span className='good-label'>Jina Lako / Your Name</span>}>
                            <Input type="text"/>
                        </Form.Item>

                        {/*Contact Person Phone*/}
                        <Form.Item
                            name="contact_phone"
                            label={<span className='good-label'>Namba ya Simu / Phone Number</span>}>
                            <Input type="text"/>
                        </Form.Item>

                        {/*Business Name*/}
                        <Form.Item
                            name="business_name"
                            label={<span className='good-label'>Jina la Biashara / Business Name</span>}>
                            <Input type="text"/>
                        </Form.Item>

                    </Card>


                    {/****---------------------
                     * TunePackage Information
                     -------------------------*/}
                    <Card bodyStyle={{backgroundColor: '#f9f9f9'}} style={{marginTop: '64px'}}>

                        {/*Service Phone Number*/}
                        <h2 style={{marginTop: '4px', color: "#E60000"}}>
                            <GiftOutlined style={{marginRight: '0.5em'}}></GiftOutlined>
                            Package Information
                        </h2>

                        <Form.Item
                            label={<span className='good-label'>Kifurushi / Package</span>}
                            name="subscription_package">
                            <Radio.Group onChange={onPackageSelection}>
                                <Radio value={1}>1 Month</Radio>
                                <Radio value={3}>3 Months</Radio>
                                <Radio value={6}>6 Months</Radio>
                                <Radio value={12}>12 Months</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {/*Voice Type*/}
                        <Form.Item label={<span className='good-label'>Aina ya Sauti / Voice Type</span>}
                                   name="voice_type">
                            <Radio.Group>
                                <Radio value="MALE">Male / Ya Kiume</Radio>
                                <Radio value="FEMALE"> Female / Ya Kike</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {/*Voice Script*/}
                        <Form.Item
                            label={<span style={{color: '#8a0000'}} className='good-label'>Maneno / Voice Script</span>}
                            name="voice_script">
                            <TextArea rows={4}/>
                        </Form.Item>

                    </Card>


                    {/****------------------------
                     * Activation Phone Numbers
                     ---------------------------*/}
                    <Card bodyStyle={{backgroundColor: '#f9f9f9'}} style={{marginTop: '64px'}}>

                        {/*Service Phone Number*/}
                        <h2 style={{color: "#E60000", marginTop: '0'}}>
                            <MobileOutlined style={{marginRight: '0.5em'}}></MobileOutlined>
                            Phones To Activate</h2>

                        <p className="good-caption">Namba za simu unazohitaji ziwekewe muito</p>

                        <Form.List name="selectedPhones"
                        >
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

                    </Card>


                    {/****----------------
                     * Summary
                     --------------------*/}
                    <Card bodyStyle={{backgroundColor: '#f9f9f9'}} style={{marginTop: '64px'}}>

                        <h2 style={{color: "#E60000", marginTop: '0'}}>Summary</h2>

                        <table width="100%">
                            <tr>
                                <td className="cart-border ">Phone Numbers</td>
                                <td className="cart-border cart-value"> {selectedPhones.length} </td>
                            </tr>

                            <tr>
                                <td className="cart-border">Package</td>
                                <td className="cart-border cart-value"> {selectedPackage?.duration ?? 'Not selected'} </td>
                            </tr>

                            <tr>
                                <td>Total</td>
                                <td className={calculateTotal() > 0 ? 'cart-total' : 'cart-total-error'}> {calculateTotal()}   </td>
                            </tr>
                        </table>

                    </Card>

                    <Card bodyStyle={{backgroundColor: '#f9f9f9'}} style={{marginTop: '64px'}}>

                        <h2 style={{color: "#E60000", marginTop: '0'}}>
                            Payment Information</h2>
                        <Form.Item
                            name="payment_phone"
                            label={<span className='good-label'>Namba ya Malipo / Payment Phone</span>}>
                            <Input type="text"/>
                        </Form.Item>


                        <Form.Item
                            style={{marginTop: '24px'}}
                            name="agreed_to_terms">
                            <Checkbox style={{fontSize: '1.2em'}}>Nimekubali Vigezo na Masharti</Checkbox>
                        </Form.Item>

                        <p>
                            <a target="_blank" href="https://www.mobiadafrica.com/privacy.html"
                               style={{marginBottom: '24px', marginTop: '4px'}} rel="noreferrer">
                                Bonyeza hapa kusoma vigezo na masharti / Click to read terms
                            </a>
                        </p>

                        <Form.Item wrapperCol={{span: 24}} style={{marginBottom: '32px', fontSize: '1.2em'}}>
                            <Button size="large" loading={isLoading} block style={{backgroundColor: '#E60000'}}
                                    type="primary"
                                    htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Card>



                </Col>



            </Row>


        </Form>

    </div>;

}

export default SubscriptionForm

