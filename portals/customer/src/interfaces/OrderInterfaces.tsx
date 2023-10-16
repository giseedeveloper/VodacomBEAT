import {Customer, DeliveryAddress} from "./CustomerInterfaces";
import {Product, ProductVariant} from "./ProductInterfaces";
import {ShippingMethod, ShippingRate} from "./ShippingInterfaces";
import {PaymentTransaction} from "./PaymentTransactions";


export interface Order {
    id: string;
    orderNumber: string;
    key: string;
    name: string;
    status: string;
    address: string;
    productStatus: string;
    thumbnailUrl: string;

    amountDue: number;
    amountPaid: number;
    remainingAmount: number;
    itemsOriginalCost: number;
    itemsDiscountedCost: number;
    itemsDiscounts: number;
    shippingFees: number;
    currency: string;

    isPaymentComplete: boolean;
    hasDelivered: boolean;
    deliveryDate: string;
    createdDate: string;

    customer: Customer;
    deliveryAddress: DeliveryAddress;
    orderProducts: OrderProduct[];
    paymentTransactions: PaymentTransaction[]

    date: string;
    votes: number;
    player:string;
    amount:number;
 }

export interface OrderProduct  {
    "id": 9,
    "userId": 16,
    "key": string,
    "customerId": number,
    "orderId": number,
    "quantity": number,
    "discount": number,
    "unitDiscountAmount": number,
    "basePrice": number,
    "unitBasePrice": number,
    "sellingPrice": number,
    "unitSellingPrice": number,
    "productName": string,
    "thumbnailUrl": string,
    "shippingFee": number,
    "discountAmount": number,
    "unitShippingFee": number,
    "product": Product,
    "variant": ProductVariant,
    "shippingMethod": ShippingMethod,
    "shippingRate": ShippingRate
}


export interface Transaction {
    "id": number,
    "vote_id": number,
    "payer_phone": string,
    "amount": number,
    "status": string,
    "reference": string,
    "third_party": string,
    "created_at": string,
    "updated_at": string
}
