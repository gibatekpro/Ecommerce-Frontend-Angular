import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {OrderHistory} from "../model/order-history";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = `${environment.apiUrl}/orders`;

  constructor(private httpClient: HttpClient) {

  }

  getOrderHistory(email: string): Observable<GetResponseOrderHistory>{

    console.log(email);

    //need to build url based on the customer email
    const orderHistoryUrl = `${this.orderUrl}/search/findOrderByCustomerEmailOrderByDateCreatedDesc?email=${email}`;

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
  }
}

interface GetResponseOrderHistory{
_embedded: {
  orders: OrderHistory[];
}
}
