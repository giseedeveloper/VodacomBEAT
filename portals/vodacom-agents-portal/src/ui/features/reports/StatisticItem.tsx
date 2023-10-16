import {Card, Space} from 'antd';
import React from 'react';


interface StatsDetails  {
    icon: React.ReactNode,
    title: string,
    subTitle: string,
    textColor: string,
    onClick?: () => void
}


const StatisticItem  = ({icon,title,subTitle,textColor,onClick}: StatsDetails) => {

    return <>
        <Card
            hoverable={true}
            onClick={onClick}
        >
            <Space align="end" style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
             }}>

                {icon}

                <div  style={{ backgroundColor:"transparent", textAlign:"end"}} >
                        <span style={{fontSize:"1em", color: textColor}}>{title}</span><br/>
                        <span style={{ fontSize:"1.4em",color:`${textColor}`, fontWeight: 'bolder' }}>{subTitle}</span>
                </div>


            </Space>
        </Card>
    </>;


}

export default StatisticItem

