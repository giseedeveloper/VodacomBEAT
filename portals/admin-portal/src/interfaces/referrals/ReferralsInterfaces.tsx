import {Commission} from "./CommissionInterfaces";


export interface ReferralAgent {
    "id": number,
    "first_name": string,
    "second_name": string,
    "phone_number": string,
    "reference_number": string,
    "sales_zone": string,
    "created_at": string,
    network: MobileNetwork
}

export interface CommissionedReferralAgent {
    "id": number,
    "first_name": string,
    "second_name": string,
    "phone_number": string,
    "reference_number": string,
    "sales_zone": string,
    "created_at": string,
    "commissions_sum_amount": string,
    "commissions_count": string,
    "commissions" : Commission[]
}

export interface MobileNetwork {
    id : string,
    name : string,
    selcom_code : string,
}

