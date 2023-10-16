import {Country} from "./ResourcesInterfaces";

export interface ShippingRate {
    "createdBy": string,
    "lastModifiedBy": string
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": number,
    "countryCode": string,
    "regionCode": string,
    "zipCode": string,
    "fee": number,
    "destinationCountry": Country,
    "shippingCategory": ShippingCategory,
    "shippingMethod": ShippingMethod,
    "currency": string
}

export interface ShippingCategory{
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": string,
    "categoryName": string,
    "volume": string,
    "weight": string,
    "description": string,
    "label": string,
    "value": string
}

export interface ShippingMethod{
    "id": number
}