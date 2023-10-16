import {DatePicker, Form, TimePicker} from "antd";
import React from "react";


export interface BroadcastMessage {
    "id": number,
    "title": string,
    "topic_code": string,
    "content": string,
    "approved": string,
    "equivalent_sms_count": string,
    "send_at": string,
    "sent_at": string,
    "created_at": string,

    "send_at_date": string,
    "send_at_time": string
}


export interface TeamTopic {
    "id": number,
    "name": string,
    "code": string,
    "subscribersCount": number,
    "created_at": string,
}

export interface SubscriptionStats {
    "reference": string,
    "subscriptions": number
}


export interface SmsHistory {
    "id": number,
    "topic_code": string,
    "topic_name": string,
    "audience_count": string,
    "message": string,
    "created_at": string,
    "initiator": string
}

export interface NotificationTemplate {
    "id": number,
    "code": string,
    "type": string,
    "content": string,
    "updated_at": string,
    "last_updated_by": string
}

export interface SmsGateway {
    "id": number,
    "provider_code": string,
    "balance": string,
    "provider_name": string,
    "sender_id": string,
    "is_default": boolean,
    "is_available": boolean,
    "last_updated_by": boolean,
    "updated_at": boolean
}
