import React from "react";


interface Props {
    children: React.ReactNode;
}

const EyasiPaddingComponent : React.FC<Props> = ({children}) => {

    return (
        <div style={{ padding: '24px' }}>
            {children}
        </div>
    );

}

export default EyasiPaddingComponent;
