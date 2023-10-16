import {Card, Col, Divider, Row, Space, Table, Tag} from 'antd';
import React from 'react';
 import {CiDesktop} from "react-icons/ci";


interface StatsDetails  {
    icon: React.ReactNode,
    title: string,
    subTitle: string,
    textColor: string
}


const DashboardStatistic  = ({icon,title,subTitle,textColor}: StatsDetails) => {

    return <>
        <Card
            hoverable={true}
        >
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
             }}>

                {icon}

                <div  style={{ backgroundColor:"transparent", textAlign:"end"}} >
                        <span style={{fontSize:"1em"}}>{title}</span><br/>
                        <span style={{ fontSize:"1.8em",color:`${textColor}` }}>{subTitle}</span>
                </div>


            </div>
        </Card>
    </>;


}

export default DashboardStatistic

