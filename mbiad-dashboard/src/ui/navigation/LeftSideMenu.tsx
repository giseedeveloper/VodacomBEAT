import React, {useState} from "react";
import Sider from "antd/es/layout/Sider";
import MenuItems from "./MenuItems";
import {Button, Col, Row} from "antd";
import {CompressOutlined} from "@ant-design/icons";

const LeftSideMenu = () => {

    const [collapsed, setCollapsed] = useState(false);


    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (<Sider theme="light"
                   className="site-layout-background"
                   collapsed={collapsed}
                   width={280}
                   style={{
                       overflow: 'auto',
                       height: '100vh',
                       position: 'fixed',
                       left: 0,
                       top: 0,
                       bottom: 0,
                   }}>

            {/*Text Logo*/}
            <div style={{
                backgroundColor: "#0582ca",
                paddingTop: '12px',
                paddingBottom: '12px'
            }}>
                <Row >
                    <Col className="gutter-row" span={1} offset={1}>
                        {/*<Image preview={false} src={logo} style={{ width: 80, marginTop: 4 }} />*/}
                    </Col>
                </Row>
                <Row style={{marginTop: 10 }}  >
                    <Col>
                        {!collapsed && <h3  style={{
                                paddingLeft: '12px',
                                color: 'white',
                                margin: "0px"}}>
                                MobiAd Africa
                            </h3>}
                    </Col>

                    <Col span={6} offset={6}>
                        <Button icon={<CompressOutlined />} size="small" type="text" onClick={toggleCollapsed}
                                style={{ marginRight: 16, marginLeft: 16, color: "white" }}>
                        </Button>
                    </Col>
                </Row>
            </div>


            {/*{isLoadingFolders ? <Spin indicator={LoadingOutlined}/> : <p></p>}*/}

            {/*Side Menu With Items*/}
            <MenuItems isInlineCollapsed={collapsed}/>


        </Sider>
    )
}

export default LeftSideMenu;
