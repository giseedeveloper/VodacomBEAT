

export interface User {
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": number,
    "loginIdentifier": string,
    "identifierType": string,
    "customerIdentifier": string,
    "staffId": 2,
    "salesChannelIdentifier": string,
    "partnerIdentifier": string,
    "firstName": string,
    "middleName": null,
    "lastName": string,
    "password": string,
    "status": string,
    "isActive": string
}


export interface Staff {
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": number,
    "name": string,
    "email": string,
    "is_active": number,
    "created_at": string,
    "updated_at": string,
    "new_password": string
}


export interface Contenstant {
    "id": number,
    "code": string,
    "name": string,
    "club_code": string,
    "club_name": string,
    "votes_count": number,
    "is_active": number,
    "email": string,
    "created_at": string,
    "updated_at": string
}

export interface Contenstant {
    "successfulTransactionsCount": number,
    "totalTransactionsCount": number,
    "revenueTotal": number,
    "revenueToday": number,
    "votesWebCount": number,
    "voteWhatsappCount": number,
    "votesUssdCount": number,
    "votesTodayCount": number,
    "votesTotalCount": number
} 