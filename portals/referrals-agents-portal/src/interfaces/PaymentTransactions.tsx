export interface PaymentTransaction {
    "id": number,
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,

    "amount": number,
    "currency": string,

    "payerName": string,
    "payerPhone": string,
    "payerAccount": string,
    "referenceNumber": string,
    "financialServiceProvider": string,
    "remark": string,
    "paymentMethod": string,
    "paymentFor": string,
    "status": string
}