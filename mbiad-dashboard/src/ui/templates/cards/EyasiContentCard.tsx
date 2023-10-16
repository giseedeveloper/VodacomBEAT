import {Card, Button, Space, Avatar} from "antd";
import BaseCardComponentProps from "../../../types/ui/BaseCardComponentProps";
import React from "react";

const EyasiContentCard = ({children, title, iconImage, subTitle, extraHeaderItems}: BaseCardComponentProps) => {

    const header = <Space style={{paddingTop:12, paddingBottom: 12}}>
        <Avatar style={{marginRight:12}} src={iconImage} shape="square"></Avatar>
        <h3>{title} <span style={{fontWeight:"lighter", fontSize:"0.9em"}}>{subTitle}</span></h3>
    </Space>


    return <Card

        title={header}
        style={{marginLeft: 24, marginRight: 24, marginTop: 32, marginBottom: 48}}
        extra={extraHeaderItems}>
        {children}
    </Card>;

}

export default EyasiContentCard;
