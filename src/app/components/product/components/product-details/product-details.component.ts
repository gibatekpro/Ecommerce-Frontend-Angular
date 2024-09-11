import {Component, OnInit} from '@angular/core';
import {Product} from "../../model/Product";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../service/product.service";
import {CartService} from "../../../cart/service/cart.service";
import {CartItem} from "../../../cart/model/CartItem";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit{

  public product!: Product;

  theProductId: number = 0;

  constructor(

    private route: ActivatedRoute,

    private productService: ProductService,

    private cartService: CartService

  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      () => this.displayProductDetails()
    );
  }

  private displayProductDetails() {

    let hasProductId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasProductId) {

      this.theProductId = +this.route.snapshot.paramMap.get('id')!;

      this.productService.getProductDetails(this.theProductId).subscribe(
        data => {
          console.log(JSON.stringify(data));
          this.product = data;
        }
      )

    }

  }

  addToCart(product: Product) {
    const cartItem = new CartItem(product);

    this.cartService.addToCart(cartItem);

  }
}
