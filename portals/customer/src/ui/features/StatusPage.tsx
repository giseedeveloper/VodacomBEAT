import React, {useState, useEffect} from 'react';
import {postRequest} from "../../http/RestService";
import {notifyHttpError} from "../../services/notification/notifications";
import {Button, Card, Col, Form, Image, Row, Space, Tag} from "antd";
import {useParams} from "react-router-dom";
import callIcon from "../../assets/images/icons/call.png";
import successPhone from "../../assets/images/icons/successful_phone.png";
import ussdPinIcon from "../../assets/images/icons/ussd.png";

import {isEmpty, isNotEmpty} from "../../utils/helpers";
import {UserOutlined} from "@ant-design/icons";

interface TuneSubscription {
    id: string,
    subscription_reference: string,
    starts_at: string,
    ends_at: string,
    payment_phone: string,
    business_name: string,
    phones: SubscriberPhone[]
}

interface SelcomTransaction {
    payment_url: string
}

interface SubscriberPhone {
    phone_number: string
}


const StatusPage = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [subscription, setSubscription] = useState<TuneSubscription>();
    const [transaction, setTransaction] = useState<SelcomTransaction>();

     const {reference} = useParams();

    //Fetch products
    useEffect(() => {
        fetchSubscription();
    }, []);


    //Fetch Packages
    const fetchSubscription = () => {
        console.log("Fetching packages...")
        setIsLoading(true)
        postRequest("/api/v1/tunes/customer/subscription/details",{
            "reference": reference
        }).then((response) => {
            setIsLoading(false)
                console.log(JSON.stringify(response.data.payload.subscription));
                setSubscription(response.data.payload.subscription);
                setTransaction(response.data.payload.transaction);
            //setPackages(response.data.payload.packages)
        }).catch((errorObj) => {
            setIsLoading(false)
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const reloadStatus = (subscriptionInformation: any) => {
        window.location.reload();
    }

    const retryPayment = () => {
        setIsLoading(true);
        postRequest("/api/v1/tunes/customer/subscription/payment/retry", {
            "reference": reference
        }).then((response) => {
            setIsLoading(false);
        }).catch((errorObj) => {
            setIsLoading(false);
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    return <div className="container" style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        marginTop: "24px",
        marginBottom: "64px",
        backgroundColor: "#ffffff"
    }}>


        <Row gutter={16}>

            {/***--------==------------
             /* Pending Subscription
             *-----------==----------***/}
            { isEmpty(subscription?.starts_at) && <Col className="gutter-row" sm={24} md={24} lg={12} style={{marginTop: '2em'}}>

                <Space className="container" align="center" style={{marginBottom: '16px'}}>
                    <Image preview={false} width={96} height={96} src={ussdPinIcon}
                           style={{
                               marginTop: '2px',
                               marginLeft: '8px'
                           }}></Image>
                    <p style={{fontSize: '1em', paddingLeft: '24px'}}>
                        Kamilisha malipo kwa kuingiza PIN kwenye simu yako <br/>
                        {subscription?.payment_phone} <br/> <br/>

                        {reference} Ni number yako ya kumbukumbu. <br/> <br/>

                        <span style={{ color: "#8a8a8a"}}>Kama umeshalipa refresh kupata status mpya</span>
                    </p>
                </Space>


                <Card bodyStyle={{backgroundColor: '#f9f9f9'}} style={{marginTop: '64px'}}>

                    <p>
                        <a target="_blank" href="https://www.mobiadafrica.com/privacy.html"
                           style={{marginBottom: '24px', marginTop: '4px'}} rel="noreferrer">
                            Bado hatujapokea malipo kutoka {subscription?.payment_phone}
                        </a>
                    </p>


                    <div style={{width: "100%"}}>
                        <Row>
                            <Col span={12}>
                                <div style={{paddingRight: "24px"}}>
                                    <Button onClick={reloadStatus} size="large" loading={isLoading} block
                                            style={{backgroundColor: '#E60000'}}
                                            type="primary" >
                                        Nimesha Lipa
                                    </Button>
                                </div>
                            </Col>

                            <Col span={12}>
                                <Button target="_blank" href={transaction?.payment_url} size="large" loading={isLoading} block
                                        style={{border: '1px solid #E60000'}}
                                        type="default" >
                                    Jaribu Tena Kulipa
                                </Button>
                            </Col>

                            <Col span={24} style={{marginTop:"24px"}}>
                                <Button target="_blank" href="/" size="large" loading={isLoading} block
                                        style={{border: '1px solid #E60000'}}
                                        type="default" >
                                    Anza Mwanzo
                                </Button>
                            </Col>
                        </Row>

                    </div>
                </Card>

            </Col> }


            {/***--------==------------
             /* Paid Subscription
             *-----------==----------***/}
            { isNotEmpty(subscription?.starts_at) && <Col className="gutter-row" sm={24} md={24} lg={12} style={{marginTop: '2em'}}>

                <Space className="container" align="center" style={{marginBottom: '16px'}}>
                    <Image preview={false} width={64} height={64} src={successPhone}
                           style={{
                               marginTop: '2px',
                               marginLeft: '8px'
                           }}></Image>
                    <h3>Imefanikiwa</h3>
                </Space>


                <p style={{fontSize: '1em'}}>
                    {reference} Malipo yako yamekamilika. <br/> <br/>
                    Huduma itaanza: {subscription?.starts_at} <br/>
                    Hadi: {subscription?.ends_at} <br/><br/>

                    Number ya malipo: <span style={{fontWeight:"lighter"}}>{subscription?.payment_phone}</span> <br/>
                    Biashara: <span style={{fontWeight:"lighter"}}> {subscription?.business_name} </span> <br/><br/>


                    Number zitakazokua na miito:<br/>
                    {subscription?.phones.map((phone)=>{
                        return  <div style={{width:"100%", marginBottom:"8px", marginTop:"8px"}}>
                            <Tag icon={<UserOutlined/>} color="default">{phone.phone_number}</Tag> <br/>
                        </div>
                    })}
                    .

                </p>

            </Col> }


        </Row>

    </div>;

}

export default StatusPage

