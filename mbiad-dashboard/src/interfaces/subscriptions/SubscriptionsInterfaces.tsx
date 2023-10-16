import {PaymentTransaction} from "../PaymentTransactions";


export interface Subscription {
    "id": number,
    "include": boolean,
    "phone_number": string,
    "topic_code": string,
    "amount": number,
    "package": string,
    "starts_at": string,
    "expires_at": string,
    "transaction" : PaymentTransaction
}
