

export interface Product {
    id: string;
    key: string;
    name: string;
    age: number;
    address: string;
    productStatus: string;
    thumbnailUrl: string;
    tags: string[];
}


export interface ProductVariant {
    "createdBy": string,
    "lastModifiedBy": string,
    "createdDate": string,
    "lastModifiedDate": string,
    "deletedDate": string,
    "id": string,
    "productId": string,
    "discountAmount": string,
    "name": string,
    "variantPrice": string,
    "variantDescription": string,
    "unitSellingPrice": string
}
