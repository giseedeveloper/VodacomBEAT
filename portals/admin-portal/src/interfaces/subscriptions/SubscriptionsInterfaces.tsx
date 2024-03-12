import {PaymentTransaction} from "../PaymentTransactions";


export interface SubscriptionPackage {
    "id": number,
    "package": string,
    "duration": string,
    "price": string,
    "commission_percentage": string,
    "commission_amount": string
}

export interface Subscription {
    "id": number,
    "include": boolean,
    "phone_number": string,
    "amount": number,
    "payment_phone": string,

    "contact_phone": string,
    "contact_person_name": string,
    "business_name": string,
    "voice_script": string,
    "voice_type": string,

    "commission_amount": number,
    "commission_issued_at": string,

    "starts_at": string,
    "expires_at": string,
    "transaction" : PaymentTransaction,
    "package" : SubscriptionPackage,
    "phones" : Phone[],
}


export interface Phone {
    "id": number,
    "subscription_id": string,
    "customer_id": string,
    "phone_number": string
}

export interface Phone {
    "id": number,
    "subscription_id": string,
    "customer_id": string,
    "phone_number": string
}
