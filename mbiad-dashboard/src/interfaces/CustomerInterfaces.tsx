

export interface DeliveryAddress {
    "id": number,
    "userId": string,
    "customerId": string,
    "countryName": string,
    "countryCode": string,
    "region": string,
    "city": string,
    "street": string,
    "contactPersonName": string,
    "contactPersonPhone": string,
    "zipcode": string,
    "isDefault": boolean
}


export interface Customer {
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": string,
    "userId": string,
    "firstName": string,
    "middleName": string,
    "lastName": string,
    "email": string,
    "phoneNumber": string,

    "device": string,
    "revenue": number,
    "location": string,
    "emailVerifiedAt": string,
    "phoneVerifiedAt": string,
    "status": string,
    "isActive": string,
    "statusRemark": string,
    "defaultDeliveryAddress": DeliveryAddress
}