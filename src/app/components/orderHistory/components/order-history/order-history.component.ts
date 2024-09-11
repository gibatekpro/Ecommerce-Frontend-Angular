import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {OrderHistory} from "../../model/order-history";
import {OrderHistoryService} from "../../service/order-history.service";
import {User} from "../../../../auth/model/user";
import {AuthService} from "../../../../auth/service/auth.service";

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit{

  orderHistoryList: OrderHistory[] = [];

  userEmail:string | undefined;

  constructor(private httpClient: HttpClient, private orderHistoryService: OrderHistoryService, private authService: AuthService) {
  }

  ngOnInit(): void {

    this.authService.authUser.subscribe(user => {

      this.userEmail = user?.email;

    });

    this.handleOrderHistory();


  }

  private handleOrderHistory() {
    //read the user's email address from browser storage

    if (this.userEmail != null) {

      // retrieve data from the service
      this.orderHistoryService.getOrderHistory(this.userEmail)
        .subscribe(data => {
          this.orderHistoryList = data._embedded.orders;
        })

    }else {
      console.log("Email is null");
    }

  }
}
