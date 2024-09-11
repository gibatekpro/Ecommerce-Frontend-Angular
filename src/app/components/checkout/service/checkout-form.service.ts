import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {Country} from "../../cart/model/country";
import {HttpClient} from "@angular/common/http";
import {State} from "../../cart/model/state";
import {environment} from "../../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class CheckoutFormService {

  private countriesUrl = `${environment.apiUrl}/countries`;

  private statesUrl = `${environment.apiUrl}/states`;

  constructor(
    private httpClient: HttpClient

  ) {
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] = [];

    //build an array for "Month" dropdown list
    // - start at current month and loop until

    for (let month = startMonth; month <= 12; month++) {
      data.push(month);
    }

    //"of" makes the data an observable
    return of(data)
  }

  getCreditCardYears(): Observable<number[]> {


    let data: number[] = [];

    //build an array for "Year" dropdown list
    // - start at current year and loop until

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      data.push(year);
    }

    //"of" makes data an observable
    return of(data);
  }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetCountries>(this.countriesUrl).pipe(
      map(
        response => response._embedded.countries
      ));
  }

  getStatesFromCountryCode(countryCode: string): Observable<State[]>{

    //search url
    const searchUrl = `${this.statesUrl}/search/findStatesByCountry_Code?code=${countryCode}`
    return this.httpClient.get<GetStates>(searchUrl).pipe(
      map(
        response => response._embedded.states
      ));
  }

}
interface GetCountries {
  _embedded: {
    countries: Country[]
  }
}
interface GetStates {
  _embedded:{
    states: State[]
  }
}
