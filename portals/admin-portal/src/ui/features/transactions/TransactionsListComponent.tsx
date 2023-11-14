import {Button, Pagination, Space, Spin, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import ordersIcon from "../../../assets/images/icons/currency.png"
import {getRequest} from "../../../services/rest/RestService";
import {notifyHttpError} from "../../../services/notification/notifications";
import {UndoOutlined} from "@ant-design/icons";
import customerLoadingIcon from "../../templates/Loading";
import Search from "antd/es/input/Search";
import moment from 'moment';
import {PaymentTransaction} from "../../../interfaces/PaymentTransactions";

const TransactionsListComponent = () => {

    const [transactionsList, updateTransactionsList] = useState<PaymentTransaction[]>([]);
    const [totalRecords, updateTotalRecords] = useState(0);
    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, updateSearchQuery] = useState("");

    //Fetch products
    useEffect(() => {
        fetchTransactions();
    }, [currentPageNo, pageSize,searchQuery]);


    const fetchTransactions = () => {
        setIsLoading(true);
        const url = `/api/v1/transactions?query=${searchQuery}&page=${currentPageNo}&perPage=${pageSize}`;
        console.log(`Fetching transactions... ${url}`)
        getRequest(url)
            .then((response) => {
                updateTransactionsList(response.data.payload.transactions.data);
                updateTotalRecords(response.data.payload.transactions.total);
                updateCurrentPageNo(response.data.payload.transactions.current_page)
            })
            .catch((errorObj) => {
                notifyHttpError('Operation Failed', errorObj)
            }).finally(() => {
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

    const columns: ColumnsType<PaymentTransaction> = [
        {
            title: 'Transaction Id',
            dataIndex: 'id',
            key: 'id',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        {record.id}
                    </Space>
                </>
            ),
        },
        {
            title: 'Subscription Id ',
            dataIndex: 'reference',
            key: 'reference',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        {record.reference}
                    </Space>
                </>
            ),
        },
        {
            title: 'Phone Number',
            dataIndex: 'payer_phone',
            key: 'payer_phone',
            render: (_, record) => (
                <>
                    {record.payer_phone} <br/>
                    <span style={{fontWeight: 'lighter'}}>Via: {record.third_party}</span>
                </>
            )

        },
        {
            title: 'Amount ',
            dataIndex: 'amount',
            key: 'key',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        {record.amount}
                    </Space>
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <>
                    <Space size="middle">
                        {record.status}
                    </Space>
                </>
            ),
        },
        {
            title: 'Date',
            key:'date',
            sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
            render: (_, date) => (
                <Space size="middle">
                    {date.created_at}
                </Space>
            ),
        },
        // {
        //     title: 'Actions',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Space size="middle">
        //             <a href={`transactions/details/` + record.id}>View</a>
        //         </Space>
        //     ),
        // },
    ];

    return <EyasiContentCard title="Transactions"
                             iconImage={ordersIcon}
                             subTitle="history"
                             extraHeaderItems={[
                                 isLoading && <Spin indicator={customerLoadingIcon}></Spin>,
                                 <Button style={{marginRight:16}} icon={<UndoOutlined/>} onClick={fetchTransactions} key="2"
                                         type="default">Refresh</Button>,
                                //  <Button href="/products/instance/new" key="1" type="primary">Add Order</Button>
                             ]}>

        {/**---------------*
         /** Search
         *----------------*/}
        <Space style={{marginBottom: 24}} direction="vertical" size="middle">
            <Space.Compact>
                <Search placeholder="Search Transaction"
                        onSearch={onSearch}
                        allowClear/>
            </Space.Compact>
        </Space>


        {/**---------------------------*
         /** Orders Table
         *-----------------------------*/}
        <Table
            columns={columns}
            dataSource={transactionsList}
            loading={isLoading}
            rowKey="id"
            pagination={false}/>

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

export default TransactionsListComponent

