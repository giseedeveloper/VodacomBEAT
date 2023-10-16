import {Subscription} from "../subscriptions/SubscriptionsInterfaces";


export interface Commission {
    "id": number,
    "amount": string,
    "percentage": string,
    "created_at": string,
    "subscription": Subscription
}
