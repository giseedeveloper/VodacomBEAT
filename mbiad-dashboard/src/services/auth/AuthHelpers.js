import {getStoredUserToken} from "../../state/auth/authStore";


const userToken = getStoredUserToken();

export function getAuthHeaders(){
     return {
         "Authorization" : "Bearer "+userToken,
         "Accept" : "application/json"
     }
}
