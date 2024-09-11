import {Component, OnInit} from '@angular/core';
import {ProductCategory} from "../../model/ProductCategory";
import {ProductService} from "../../service/product.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css']
})
export class ProductCategoryMenuComponent implements OnInit{
  productCategories: ProductCategory[] = [];

  constructor(

    private productService: ProductService,

    private route: ActivatedRoute

  ) {

  }


  ngOnInit(): void {

    this.listProductCategories();

  }


  private listProductCategories() {

    this.productService.getProductCategoriesList().subscribe(
      data => {
        console.log(data);
        this.productCategories  = data
      }
    );

  }
}
