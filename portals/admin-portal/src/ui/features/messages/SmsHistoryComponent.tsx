import {Button, Form, Input, Modal, Pagination, Space, Spin, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import sectionIcon from "../../../assets/images/icons/agreement.png"
import {getRequest, postRequest} from "../../../http/RestService";
import {notifyHttpError, notifySuccess} from "../../../services/notification/notifications";
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import customerLoadingIcon from "../../templates/Loading";
import { SmsHistory} from "../../../interfaces/MessagesInterfaces";



const MessagesComponent = () => {

    const columns: ColumnsType<SmsHistory> = [
        {
            title: 'S/N',
            dataIndex: 'id',
            render: (_, record) => (<> {record.id}</>),
        },
        {
            title: 'Topic',
            dataIndex: 'topic_name',
            render: (_, record) => (<> {record.topic_code}</>),
        },
        {
            title: 'Audience',
            dataIndex: 'audience_count',
            render: (_, record) => (<> {record.audience_count} </>),
        },
        {
            title: 'Message Content',
            dataIndex: 'message',
            render: (_, record) => (<> {record.message} </>),
        },
        {
            title: 'Initiator',
            dataIndex: 'created_at',
            render: (_, record) => (<> {record.initiator} </>),
        },
        {
            title: 'Broadcasted',
            dataIndex: 'created_at',
            render: (_, record) => (<> {record.created_at} </>),
        }
    ];

    const [referralsList, updateReferralsList] = useState<SmsHistory[]>([]);
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
        console.log("Fetching agents...")
        setIsLoading(true)
        getRequest(`/api/v1/messages/history?query=${searchQuery}`).then((response) => {
            updateReferralsList(response.data.payload.history.data);
            updateTotalRecords(response.data.payload.history.total);
            updateCurrentPageNo(response.data.payload.history.current_page)
            updatePageSize(response.data.payload.history.per_page)
            setIsLoading(false);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(() => {
            setIsLoading(false)
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

    return <EyasiContentCard title="SMS History"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[
                                 isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
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


    </EyasiContentCard>;

}

export default MessagesComponent

