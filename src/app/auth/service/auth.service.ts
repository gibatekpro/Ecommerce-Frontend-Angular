import {Injectable} from '@angular/core';
import {User} from "../model/user";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AuthRequestBody} from "../model/auth-request-body";
import {environment} from "../../../environments/environment";
import {AuthResponse} from "../model/auth-response";
import {map} from "rxjs";
import {RegisterRequestBody} from "../model/register-request-body";
import {storage} from "../../config";

@Injectable({
  providedIn: 'root'
})
export class AuthService{

  public isAuthenticated: boolean;

  public authUserKey: string = 'authUser';

  user: User | undefined;

  authUser: Subject<User | null | undefined> = new BehaviorSubject<User | null | undefined>(null);

  constructor(private router: Router, private http: HttpClient) {

    //Check if auth data exists in storage, then update
    this.checkAndUpdateData();

    this.isAuthenticated = this.authUser != null;
    this.updateAuthentication();

  }

  register(registerRequestBody: RegisterRequestBody) {
    let authUrl = `${environment.apiUrl}/auth/register`;
    return this.http.post<AuthResponse>(authUrl, registerRequestBody)
      .pipe(map(response => {

        this.authResponseOperations(response);

        return response;
      }));
  }

  authenticate(authBody: AuthRequestBody): Observable<any> {
    let authUrl = `${environment.apiUrl}/auth/login`;
    return this.http.post<AuthResponse>(authUrl, authBody)
      .pipe(map(response => {

        this.authResponseOperations(response);

        return response;
      }));
  }

  logout() {

    this.user = new User();
    // remove user from local storage and set current user to null

    storage.removeItem(this.authUserKey);
    this.authUser.next(null);

    this.router.navigate(['/']).then();
  }


  private authResponseOperations(response: AuthResponse) {

    //set user to null to refresh the data
    this.user = new User();

    this.user!.id = response.id;
    this.user!.firstName = response.firstName;
    this.user!.lastName = response.lastName;
    this.user!.email = response.email;
    this.user!.jwtToken = response.jwtToken;

    // this.accessToken.next(response.jwtToken);
    // storage.setItem('token', JSON.stringify(this.accessToken));
    //
    // this.authUser.next(user);
    // storage.setItem(this.authUserKey, JSON.stringify(user));

    //compute the value and save in storage
    this.computeAuthData();

  }

  private checkAndUpdateData() {

    let userData = JSON.parse(storage.getItem(this.authUserKey)!);

    if (userData != null) {

      this.user = userData;

      //computeAuthData
      this.computeAuthData();

    }

  }

  private computeAuthData() {

    //set authUser subject as Data from storage
    this.authUser.next(this.user);

    //ensure data is saved in storage
    this.saveUserData();

  }

  private saveUserData() {

    //save current user in storage
    storage.setItem(this.authUserKey, JSON.stringify(this.user));

  }

  private updateAuthentication() {

    this.authUser.subscribe(
      user => {
        this.isAuthenticated = user != null;
      }
    )
  }
}
