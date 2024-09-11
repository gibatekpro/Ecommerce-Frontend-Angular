import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Product} from "../model/Product";
import {ProductCategory} from "../model/ProductCategory";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = `${environment.apiUrl}/products`;
  private productCategoryUrl = `${environment.apiUrl}/product-categories`;
  private keywordSearchUrl: string = `${environment.apiUrl}/products/search/findByNameContainsIgnoreCase?name=`;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  getProductList(theCategoryId: number): Observable<Product[]> {

    //need to build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByProductCategoryId?id=${theCategoryId}`;
    //TODO: need to build URL based on category id ... will come back to this!

    return this.httpClient.get<GetResponse>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProductListPaginate(thePage: number,
                         thePageSize: number,
                         theCategoryId: number): Observable<GetResponseProducts> {

    //need to build URL based for pagination
    const searchUrl = `${this.baseUrl}/search/findByProductCategoryId?id=${theCategoryId}`
      + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductCategoriesList(): Observable<ProductCategory[]> {

    return this.httpClient.get<GetCategoryResponse>(this.productCategoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );

  }

  getProductByKeyword(keyword: string): Observable<Product[]> {
    return this.httpClient.get<GetResponse>(`${this.keywordSearchUrl}${keyword}`).pipe(
      map(response => response._embedded.products)
    );
  }

  getProductDetails(theProductId: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.baseUrl}/${theProductId}`).pipe(
    );
  }


  getProductByKeywordPaginate(thePage: number, thePageSize: number, keyword: string): Observable<GetResponseProducts> {

    let searchUrl = `${this.keywordSearchUrl}${keyword}` + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);

  }
}

interface GetResponse {
  _embedded: {
    products: Product[];
  }
}

//Here we have two objects, the first is _embedded
//The second is page
interface GetResponseProducts {
   _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: 0
  }
}

interface GetCategoryResponse {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

/**
 *
 * HATEOAS (Hypermedia as the Engine of Application State) principle,
 * which is a constraint of the REST architectural style. In this pattern,
 * resources returned by an API include hyperlinks to related resources, allowing
 * the client to navigate the API's resource graph without needing to hardcode URLs or endpoints.
 * */

// {
//   "_embedded": {
//   "products": []
// },
//   "_links": {},
//   "page": {
//   "size": 20,
//     "totalElements": 25,
//     "totalPages": 2,
//     "number": 0
// }
// }
