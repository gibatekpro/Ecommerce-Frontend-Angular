import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../service/product.service";
import {Product} from "../../model/Product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../../cart/model/CartItem";
import {CartService} from "../../../cart/service/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;

  //new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  theKeyword: string = '';

  previousKeyword: string = "";

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
    this.listProducts();

  }

  listProducts() {
    //check if "keyword" parameter is available
    if (this.route.snapshot.paramMap.has('keyword')) {
      this.displayBySearchKeyword();
    } else {
      this.displayByCategoryId();
    }
  }

  private displayBySearchKeyword() {
    this.theKeyword = this.route.snapshot.paramMap.get('keyword')!;
    // this.productService.getProductByKeyword(this.theKeyword).subscribe(
    //   data => {
    //     this.products = data;
    //   }
    // );

    if (this.previousKeyword != this.theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = this.theKeyword;

    this.productService.getProductByKeywordPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      this.theKeyword
    ).subscribe(
      this.processResults()
    )
  }

  private displayByCategoryId() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      //get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      //not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    //
    //check if we have a different category than previous
    //

    //if we have a different category id than previous
    //then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    this.productService.getProductListPaginate(
      this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(
        this.processResults()
    );
  }

  updatePageSize(value: string) {

    this.thePageSize = +value;
    this.thePageNumber = 1;
    this.listProducts();

  }

  private processResults() {
    return (data: any)=>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements
    };
  }

  addToCart(product: Product) {

    const cartItem = new CartItem(product);

    this.cartService.addToCart(cartItem);

  }

  protected readonly console = console;
}
