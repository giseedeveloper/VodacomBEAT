import { notification } from "antd";


export  function notifySuccess(title='Success', msg ){
    notification['info']({
        message: title,
        description: msg,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });
}

export  function notifyError(title='Error', msg ){
    notification['error']({
        message: title,
        description: msg,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });
}

export  function notifyHttpError(title='Request Failed', errorObject = { } ){

    const msg = `${errorObject.errorMessage}. ${errorObject.respCode}-${errorObject.errorHttpCode}`;
    notification['error']({
        message: title,
        description: msg,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });
}


export  function notifyFormErrors(title='Invalid Inputs', errorData = [] ){

    console.warn("notifyFormErrors(): ", JSON.stringify(errorData))

    let msg = ""
    for (let i = 0; i < errorData.length; i++) {
        msg = msg + (i+1)+"."+errorData[i].errors[0] +", "
    }

    notification['warn']({
        message: title,
        description: msg,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });

}
