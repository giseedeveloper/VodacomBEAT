import {Tag} from "antd";
import React from "react";

const SystemVersion = () => {
    return (
        <div>
            <div style={{
                position: 'fixed',
                bottom: '16px',
                right: '32px',
                zIndex:"1000"}}>
                <Tag>v0.0.21</Tag>
            </div>
        </div>
    )
}

export default SystemVersion