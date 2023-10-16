
import React from 'react';

const statGroupCss : React.CSSProperties = {
    padding: '16px 0px 16px 0px',
    borderRadius: '12px',
    marginTop: "16px"
};

const statHeadingHolderStyle : React.CSSProperties = {
    marginTop: -24
};



interface StatsDetails  {
    children: any,
    icon?: React.ReactNode,
    title: string,
    subTitle?: string,
    textColor?: string
}

const StatisticsGroup  = ({children,icon,title,subTitle,textColor}: StatsDetails) => {

    const statHeadingStyle : React.CSSProperties = {
        borderRadius: "8px",
        display: "inline-block",
        padding: "4px 8px",
        marginTop: 0,
        color: textColor
    };

    return <>
        <div style={statGroupCss}>
            <div style={statHeadingHolderStyle} >
                <h2 style={statHeadingStyle}>{title}</h2>
            </div>

            {children}
        </div>
    </>;


}

export default StatisticsGroup

