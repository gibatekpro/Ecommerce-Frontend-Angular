import {Component, OnInit} from '@angular/core';
import {CartService} from "../../service/cart.service";
import { faMinus, faPlus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css']
})
export class CartStatusComponent implements OnInit{

  faMinus = faMinus;
  faPlus = faPlus;
  faShoppingCart = faShoppingCart;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  constructor(
    private cartService: CartService
  ) {
  }

  ngOnInit(): void {

    this.updateCartService();

  }

  private updateCartService() {

    //subscribe to the cart status totalPrice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    //subscribe to the cart status totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }
}
