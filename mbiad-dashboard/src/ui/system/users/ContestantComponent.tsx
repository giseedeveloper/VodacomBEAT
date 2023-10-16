import {Avatar, Button, Form, Image, Input, Modal, Space, Spin, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useEffect, useState} from 'react';
import EyasiContentCard from "../../templates/cards/EyasiContentCard";
import sectionIcon from "../../../assets/images/icons/people.png"
import {getRequest, postRequest} from "../../../services/rest/RestService";
import {notifyHttpError, notifySuccess} from "../../../services/notification/notifications";
import {Contenstant} from "../../../interfaces/system/AuthInterfaces";
import customerLoadingIcon from "../../templates/Loading";

const getStatusColor =(status:string)=>{
    if(status=="DELIVERED"){
        return "green"
    }
    if(status=="Not_Active"){
        return "#0050B3"
    }
    if(status=="Archived"){
        return "#b08968"
    }
    return "grey"
}
 


const ContestantComponent = () => {


    const columns: ColumnsType<Contenstant> = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (_,record) => ( <> {record.name}</>),
        }, 
        {
            title: 'Club',
            dataIndex: 'club_name',
            render: (_,record) => ( <> {record.email} </>),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (_,record) => ( <> {record.is_active==1?"Active":"InActive"} </>),
        },
        {
            title: 'Created',
            dataIndex: 'createdDate',
            render: (_,record) => ( <> {record.created_at} </>),
    
        },
        {
            title: 'Updated',
            dataIndex: 'updatedDate',
            render: (_,record) => ( <> {record.updated_at} </>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Space size="middle">
                {/* <a onClick={()=>showresetPasswordForm(record.id)}>Reset Password</a>  */}
              </Space>
            ),
        }
    ];

    const [staffList, updateOrdersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userID, setUserID] = useState(0)

    const [shippingCategoryForm] = Form.useForm();
    const [shippingCategoryModalOpen, setShippingCategoryModal] = useState(false)

    const [resetPasswordForm] = Form.useForm();
    const [resetPasswordModalOpen, setPasswordModal] = useState(false)


    //Fetch products
    useEffect(() => {
       fetchStaff();
    }, []);

    useEffect(() => {
    }, [staffList]);

    const fetchStaff = () => {
        console.log("Fetching staff...")
        setIsLoading(true)
        getRequest("/api/v1/contestants").then((response) => {  
            updateOrdersList(response.data.payload.users.data);
        }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        }).finally(()=>{
            setIsLoading(false)
        })
    }

    const showresetPasswordForm = (staff = 0) => {
        setUserID(staff);
        setPasswordModal(true);
        resetPasswordForm.resetFields();
        resetPasswordForm.setFieldsValue(staff);
    }

    const showShippingCategoryForm = (staff = {}) => {
        setShippingCategoryModal(true)
        shippingCategoryForm.resetFields();
        shippingCategoryForm.setFieldsValue(staff);
    }


    const handleShippingCategorySave = (staff : Contenstant) => {
        console.log(JSON.stringify(staff))
        postRequest("/api/v1/management/users/add", staff)
            .then((response) => {
                notifySuccess("Staff Created", "")
                fetchStaff();
            }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        })
        setShippingCategoryModal(false)
    }

    const handleResetPasswordSave = (staff : Contenstant) => {  
        staff.id = userID;
        console.log(JSON.stringify(staff))
        postRequest("/api/v1/management/users/password/reset", staff)
            .then((response) => {
                notifySuccess("Password Reset", "")
                fetchStaff();
            }).catch((errorObj) => {
            notifyHttpError('Operation Failed', errorObj)
        })
        setPasswordModal(false)
    }


    return <EyasiContentCard title="Contenstants"
                             iconImage={sectionIcon}
                             subTitle=""
                             extraHeaderItems={[
                                  isLoading && <Spin key="customerLoadingIcon" indicator={customerLoadingIcon}></Spin>,
                                  <Button key="addStaffButton" type="primary" onClick={showShippingCategoryForm} ghost>Add Staff</Button>
                              ]}>

        {/**---------------------------*
         /** Staff Table
         *-----------------------------*/}
        <Table columns={columns} dataSource={staffList}/>


        {/***------------------------------
         /*  Shipping Category Form
         ***------------------------------*/}
        <Modal title="User information"
               open={shippingCategoryModalOpen}
               onOk={() => {
                   shippingCategoryForm.submit()
               }}
               onCancel={() => {
                   setShippingCategoryModal(false)
               }}>

            <Form
                form={shippingCategoryForm}
                layout="vertical"
                onFinish={handleShippingCategorySave}
            >

                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Name"
                >
                    <Input/>
                </Form.Item> 

                <Form.Item
                    name="email"
                    label="Login Email"
                >
                    <Input/>
                </Form.Item>  

                <Form.Item
                    name="password"
                    label="Password"
                >
                    <Input type="password"/>
                </Form.Item>

            </Form>

        </Modal>


        {/***------------------------------
         /*  Reset Password Form
         ***------------------------------*/}

        <Modal title="Reset Password"
               open={resetPasswordModalOpen}
               onOk={() => {
                resetPasswordForm.submit()
               }}
               onCancel={() => {
                   setPasswordModal(false)
               }}>

            <Form
                form={resetPasswordForm}
                layout="vertical"
                onFinish={handleResetPasswordSave} >

                <Form.Item
                    name="new_password"
                    label="New Password"  > 
                    <Input type="password"/>
                </Form.Item>

            </Form>

        </Modal>


    </EyasiContentCard>;

}

export default ContestantComponent

