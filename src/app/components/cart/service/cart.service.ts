import {Injectable} from '@angular/core';
import {CartItem} from "../model/CartItem";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  //Subject is a subclass of Observable
  //We can use subject to publish events in our code.
  //The event will be sent to all the subscribers
  //It is Like Event Listener in android
  //
  //We will use new ReplaySubject so that events that subscribe
  //after will get the previous events
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  //We can either make use of session Storage or local storage
  // storage: Storage = sessionStorage;
  storage: Storage = localStorage;

  constructor() {

    //read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data != null) {
      this.cartItems = data;

      //compute based on the data that is read from storage
      this.computeCartTotals();
    }

  }

  addToCart(theCartItem: CartItem) {

    //check if we already have the item in our cart
    let _alreadyExistsInCart: boolean = false;
    let _existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.length > 0) {
      //find the item in the cart based on item id
      // === checks if two values are equal in
      // value and type.
      _existingCartItem = this.cartItems.find(cartItem => cartItem.id === theCartItem.id)

      //check if we found it
      _alreadyExistsInCart = (_existingCartItem != undefined)

    }

    if (_alreadyExistsInCart) {

      //increment the quantity
      _existingCartItem!.quantity++;

    } else {
      //just add the item to the array
      this.cartItems.push(theCartItem);
    }
    //compute the cart quantity and cart total
    this.computeCartTotals();

  }

  remove(theCartItem: CartItem) {

    //get index of item in the array
    const itemIndex = this.cartItems.findIndex(cartItem => cartItem.id = theCartItem.id);

    //if found(index will be greater than -1), remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }

  }

  decrementQuantity(cartItem: CartItem) {

    cartItem.quantity--;

    if (cartItem.quantity === 0) {

      this.remove(cartItem);

    }else{
      this.computeCartTotals();
    }

  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }

  public computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {

      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;

    }
    //publish the new values ... all subscribers will receive the new data
    //.next(...) will publish/send event
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //persist cart data
    this.persistCartItems();

  }

}
