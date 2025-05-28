import axiosClient from "./axios";
import {isNotEmpty} from "../utils/helpers";
import {getStoredUserToken} from "../state/auth/authStore";



const  removeLoggedUser = () => {
    console.log("401 Logging user off")
    localStorage.clear();
    window.location.replace(window.location.host)
}


const toErrorObject = (error) => {

    let errorObject = {
        errorMessage: '',
        errorHttpCode: '',
        respCode: '',
        extraInfo: ''
    };

    if (isNotEmpty(error.response)) {

        errorObject.errorHttpCode = error.response.status;

        if (isNotEmpty(error.response.data)) {
            const backendResp = error.response.data;
            errorObject.errorMessage = backendResp.message;
            errorObject.respCode = backendResp.respCode;
            errorObject.extraInfo = backendResp.respBody ? backendResp.respBody : '';
        } else {
            errorObject.errorMessage = "Request Failed";
            errorObject.respCode = "Unknown";
            errorObject.extraInfo = "";
        }

    } else {

        console.log(JSON.stringify(error))
        errorObject.errorMessage = error.message + '. Request failed! We don\'t know much about what happened. Make Sure the server is reachable and you are connected to the internet';
        errorObject.respCode = '';
        errorObject.extraInfo = '';
    }

    return errorObject;
}

export function getRequest(uri) {

    console.log(`${axiosClient.defaults.baseURL}${uri}`)

    //Todo: improve this
    const userToken = getStoredUserToken();
    axiosClient.defaults.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Authorization': `Bearer ${userToken}`
    }
    //Todo: [end] improve this

    return new Promise((resolve, reject) => {

        return axiosClient.get(`${uri}`, `${JSON.stringify(axiosClient.defaults.headers)}`)
            .then(response => {
                resolve(response);
            }).catch(error => {

                const customErrorObject = toErrorObject(error);
                if(customErrorObject.errorHttpCode===401 || error.response?.status===401){
                    removeLoggedUser();
                }
                reject(customErrorObject);
            });
    });

}

export function postRequest(uri, payload) {

    console.log(`${axiosClient.defaults.baseURL}${uri}`)

    //Todo: improve this
    const userToken = getStoredUserToken();
    axiosClient.defaults.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Authorization': `Bearer ${userToken}`
    }
    //Todo: [end] improve this

    return new Promise((resolve, reject) => {

        axiosClient.post(`${uri}`, payload)
            .then(response => {
                resolve(response);
            }).catch(error => {
            const customErrorObject = toErrorObject(error);
            if(customErrorObject.errorHttpCode===401 || error.response.status===401){
                removeLoggedUser();
            }
            reject(customErrorObject);
        });
    });

}

export function patchRequest(uri, payload) {
    return axiosClient.patch(`${uri}`, payload).then(response => response);
}

export function deleteRequest(uri) {
    return axiosClient.delete(`${uri}`).then(response => response);
}
