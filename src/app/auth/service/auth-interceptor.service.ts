import {inject, Inject, Injectable, OnInit} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {OKTA_AUTH} from "@okta/okta-angular";
import {OktaAuth} from "@okta/okta-auth-js";
import {catchError, from, lastValueFrom, Observable, throwError} from "rxjs";
import {environment} from "../../../environments/environment";
import {AuthService} from "./auth.service";
import {User} from "../model/user";
import {storage} from "../../config";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService  implements HttpInterceptor{

  user: User | undefined;

  isAuthenticated: boolean | undefined;

  constructor(private authService: AuthService) {

    this.authService.authUser.subscribe(
      user => {

        this.user = user!

        this.isAuthenticated = user != null || user != undefined;

      }
    )

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }

  private handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>>{


    //Only add an access token for secured endpoints
    const securedEndpoints = [`${environment.apiUrl}/orders`];

    if (securedEndpoints.some(url => req.urlWithParams.includes(url)) && this.authService.isAuthenticated) {


      //get access token
      let accessToken = this.user!.jwtToken;

      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });

    }
    return lastValueFrom(next.handle(req).pipe(catchError(this.handleError)));
  }

  /*
  *  If there is a 401 Unauthorized or 403 Forbidden response the user is
  * automatically logged out of the application, all other errors are re-thrown
  * up to the calling service so an alert with the error can be displayed on the screen.
  * */
  private handleError(error: any): Observable<never> {
    if ([401, 403].includes(error.status) && this.authService.authUser) {
      // auto logout if 401 or 403 response returned from API
      this.authService.logout();
    }

    const errorMessage = error.error?.message || error.statusText;
    console.error(error);
    return throwError(() => errorMessage);
  }


}
