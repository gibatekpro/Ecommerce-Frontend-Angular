import {Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {AppComponent} from './app.component';
import {ProductListComponent} from './components/product/components/product-list/product-list.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ProductService} from "./components/product/service/product.service";
import {Router, RouterModule, Routes} from "@angular/router";
import {
  ProductCategoryMenuComponent
} from './components/product/components/product-category-menu/product-category-menu.component';
import {SearchComponent} from './components/product/components/search/search.component';
import {ProductDetailsComponent} from './components/product/components/product-details/product-details.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CartStatusComponent} from './components/cart/components/cart-status/cart-status.component';
import {CartDetailsComponent} from './components/cart/components/cart-details/cart-details.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {CheckoutFormComponent} from './components/checkout/components/checkout-form.component';
import {ReactiveFormsModule} from "@angular/forms";
import {OktaAuth} from '@okta/okta-auth-js';
import {MembersPageComponent} from "./components/protected/components/members-page/members-page.component";
import {OrderHistoryComponent} from './components/orderHistory/components/order-history/order-history.component';
import {authGuard} from "./auth/guards/auth.guard";
import {AuthInterceptorService} from "./auth/service/auth-interceptor.service";
import {AuthModule} from "./auth/auth.module";
import {AuthService} from "./auth/service/auth.service";


const routes: Routes = [
  {
    path: 'order-history', component: OrderHistoryComponent,
    canActivate: [authGuard],
    // data: {onAuthRequired: sendToLoginPage}
  },
  {
    path: 'members', component: MembersPageComponent,
    canActivate: [authGuard],
    // data: {onAuthRequired: sendToLoginPage}
  },
  {path: 'cart-details', component: CartDetailsComponent},
  {path: 'checkout', component: CheckoutFormComponent},
  {path: 'products/:id', component: ProductDetailsComponent},
  {path: 'category/:id', component: ProductListComponent},
  {path: 'search/:keyword', component: ProductListComponent},
  {path: 'category', component: ProductListComponent},
  {path: 'products', component: ProductListComponent},
  {path: '', redirectTo: '/products', pathMatch: 'full'},
  {path: '**', redirectTo: '/products', pathMatch: 'full'},
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  // },
  // {
  //   path: 'sample',
  //   loadChildren: () => import('./sample/sample.module').then(m => m.SampleModule),
  // },
];

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCategoryMenuComponent,
    SearchComponent,
    ProductDetailsComponent,
    CartStatusComponent,
    CartDetailsComponent,
    CheckoutFormComponent,
    MembersPageComponent,
    OrderHistoryComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    CommonModule,
    ReactiveFormsModule,
    AuthModule
  ],
  providers: [ProductService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
