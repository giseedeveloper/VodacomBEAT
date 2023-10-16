import {Avatar, Button, Image, Pagination, Space, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import sectionIcon from "../../../assets/images/icons/admin.png"
import {getRequest, postRequest} from "../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../services/notification/notifications";
import {Customer} from "../../../interfaces/CustomerInterfaces";
import Search from "antd/es/input/Search";


const getStatusColor =(status:string)=>{
    if(status=="DELIVERED"){
        return "green"
    }
    if(status=="Not_Active"){
        return "#0050B3"
    }
    if(status=="Coming_Soon"){
        return "blue"
    }
    if(status=="Archived"){
        return "#b08968"
    }
    return "grey"
}


const columns: ColumnsType<Customer> = [
    {
        title: 'Email',
        dataIndex: 'id',
        key: 'id',
        render: (_, customer) => (
            <>
               <table>
                  <tbody>
                  <tr><td>{customer.firstName} {customer.lastName}</td></tr>
                  <tr><td style={{fontWeight:"bold"}}>{customer.email}</td></tr>
                  </tbody>
               </table>
            </>
        ),
    },
    {
        title: 'Phone Number',
        dataIndex: 'device',
        render: (_, {phoneNumber}) => (
            <>
                {phoneNumber??"N/A"}
            </>
        ),
    },
    {
        title: 'OS ',
        dataIndex: 'device',
        render: (_, {revenue}) => (
            <>
                {revenue??"N/A"}
            </>
        ),
    },
    {
        title: 'Description ',
        dataIndex: 'device',
        render: (_, {device,location}) => (
            <table>
                <tbody>
                <tr><td>{device}</td></tr>
                <tr><td>{location}</td></tr>
                </tbody>
            </table>
        ),
    },
    {
        title: 'Browser',
        dataIndex: 'browser',
        render: (_, {status}) => (
            <>
                <Tag color={getStatusColor(status)}>
                    {status?.replace("_"," ")??"Unknown"}
                </Tag>
            </>
        ),
    },
    {
        title: 'Date',
        render: (_, record) => (
            <Space size="middle">
                <a href={`orders/details/`+record.id}>View</a>
            </Space>
        ),
    },
];

const CustomersListComponent = () => {

    const [currentPageNo, updateCurrentPageNo] = useState(1);
    const [pageSize, updatePageSize] = useState(5);
    const [totalLogs, updateTotalLogs] = useState(0);
    const [customersList, updateOrdersList] = useState([]);
    const [searchQuery, updateSearchQuery] = useState("");

    //Fetch products
    useEffect(() => {
       fetchCustomers();
    }, [currentPageNo, pageSize,searchQuery]);

    const onPageChange = (page: number, pageSize: number) => {
        updateCurrentPageNo(page)
    }
    const onPageSizeChange = (current: number, size: number) => {
        updatePageSize(size)
    }

    const onSearch = (value: string) => {
        updateSearchQuery(value)
    }

    const fetchCustomers = () => {
        console.log("Fetching logs...")
        getRequest("/api/v1/manage/customers").then((response) => {
            updateOrdersList(response.data.items);
            updateOrdersList(response.data.totalElements);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        })
    }

    return <EyasiContentCard title="Logs"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[]}>

        {/**---------------*
         /** Search
         *----------------*/}
        <Space style={{marginBottom: 24}} direction="vertical" size="middle">
            <Space.Compact>
                <Search placeholder="Search Logs"
                        onSearch={onSearch}
                        allowClear/>
            </Space.Compact>
        </Space>

        {/**---------------------------*
         /** Logs Table
         *-----------------------------*/}
        <Table columns={columns} dataSource={customersList}/>

         {/**---------------------------*
         /** Pagination
         *-----------------------------*/}
        <Pagination style={{marginTop: 32, marginBottom: 32}}
                    pageSize={pageSize}
                    current={currentPageNo}
                    total={totalLogs}
                    simple={false}
                    showSizeChanger={true}
                    onChange={onPageChange}
                    showQuickJumper={true}
                    onShowSizeChange={onPageSizeChange}
        />

    </EyasiContentCard>;

}

export default CustomersListComponent

