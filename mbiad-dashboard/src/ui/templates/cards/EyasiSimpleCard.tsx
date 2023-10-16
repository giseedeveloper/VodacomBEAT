import React from "react";
import {Card} from "antd";


interface Props {
    children: React.ReactNode;
    title: string,
    subTitle: string,
}

const EyasiSimpleCard: React.FC<Props> = ({children,title,subTitle}) => {


    const titleHeading = <h3 style={{margin: 0, textAlign: "left"}}>{title}</h3>

    return (
        <Card title={titleHeading} style={{marginLeft:24, marginRight:24}}>
            {children}
        </Card>
    );

}

export default EyasiSimpleCard;
