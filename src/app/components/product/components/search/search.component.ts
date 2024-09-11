import { Component } from '@angular/core';
import {ProductService} from "../../service/product.service";
import {Product} from "../../model/Product";
import {Router} from "@angular/router";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  products: Product[] = [];

  constructor(

    private router: Router

  ) {
  }

  searchByKeyword(keyword: string) {

    console.log(keyword);

    this.router.navigateByUrl(`/search/${keyword}`);

  }
}
