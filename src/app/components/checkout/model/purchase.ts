import {Customer} from "./customer";
import {Address} from "./address";
import {Order} from "./order";
import {OrderItem} from "./order-item";

export class Purchase {

  customer: undefined | Customer;

  shippingAddress: undefined | Address;

  billingAddress: undefined | Address;

  order: undefined | Order;

  orderItems: undefined | OrderItem[];

}
