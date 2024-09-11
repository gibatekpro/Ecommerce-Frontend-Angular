import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CheckoutFormService} from "../service/checkout-form.service";
import {Country} from "../../cart/model/country";
import {State} from "../../cart/model/state";
import {CustomValidator} from "../util/custom-validator";
import {CartService} from "../../cart/service/cart.service";
import {CheckoutService} from "../service/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../model/order";
import {OrderItem} from "../model/order-item";
import {Purchase} from "../model/purchase";
import {environment} from "../../../../environments/environment";
import {PaymentInfo} from "../model/payment-info";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout-form.component.html',
  styleUrls: ['./checkout-form.component.css']
})
export class CheckoutFormComponent implements OnInit {

  checkOutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];

  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  // initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private checkoutFormService: CheckoutFormService,
              private cartService: CartService,
              private checkOutService: CheckoutService,
              private router: Router) {

    this.checkOutFormGroup = this.createFormGroup();

  }

  ngOnInit(): void {

    //set up Stripe payment form
    this.setUpStripePaymentForm();

    this.checkoutFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      });

    this.reviewCartDetails();
  }

  private createFormGroup(): FormGroup {
    //read the user's email address from browser storage
    const userEmail = JSON.parse(this.storage.getItem('userEmail')!)

    return this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        lastName: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        email: new FormControl(userEmail,
          [Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), CustomValidator.notOnlyWhitespace])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required, Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        city: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        city: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('',
          [Validators.required,
            Validators.minLength(2), CustomValidator.notOnlyWhitespace]),

      }),
      creditCard: this.formBuilder.group({
      }),
    })
  }

  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.checkOutFormGroup.get('customer')?.value);

    if (this.checkOutFormGroup.invalid) {
      this.checkOutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order(this.totalQuantity, this.totalPrice);

    //get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(cartItem => new OrderItem(cartItem));

    // set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkOutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkOutFormGroup.controls['shippingAddress'].value;
    const shippingState = JSON.parse(JSON.stringify(purchase.shippingAddress?.state));
    const shippingCountry = JSON.parse(JSON.stringify(purchase.shippingAddress?.country));
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.state;

    //populate purchase - billing address
    purchase.billingAddress = this.checkOutFormGroup.controls['billingAddress'].value;
    const billingState = JSON.parse(JSON.stringify(purchase.billingAddress?.state));
    const billingCountry = JSON.parse(JSON.stringify(purchase.billingAddress?.country));
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.state;


    //populate purchase - order and OrderItems
    purchase.order = order;
    purchase.orderItems = orderItems

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.description = "Ecommerce shop"
    this.paymentInfo.receiptEmail = purchase.customer?.email;

    //if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkOutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true;

      this.checkOutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          console.log("===>>>" + JSON.stringify(paymentIntentResponse));
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer?.email,
                  name: `${purchase.customer?.firstName} ${purchase.customer?.lastName}`
                },
                // address: {
                //   line1: purchase.billingAddress?.street,
                //   city: purchase.billingAddress?.city,
                //   state: purchase.billingAddress?.state,
                //   postal_code: purchase.billingAddress?.zipCode,
                //   country: this.billingAddressCountry?.value.code
                // }
              }
            }, {handleActions: false})
            .then((result: any) => {
              if (result.error) {

                //inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                //call REST API via the CheckoutService
                this.checkOutService.placeOrder(purchase).subscribe(
                  {
                    next: (response: any) => {
                      alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`);
                      // reset cart
                      this.resetCart();
                      this.isDisabled = false;
                    },
                    error: (err: any) => {
                      alert(`There was an error: ${err.message}`);
                    },
                  }
                );
              }
            })
        }
      );

    } else {
      this.checkOutFormGroup.markAllAsTouched();
      return;
    }

  }

  private resetCart() {
    //reset cart Data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    //reset the form
    this.checkOutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products")

  }


  copyShipToBill(event: any): void {
    if (event.target.checked) {
      const shippingAddressControl = this.checkOutFormGroup.get('shippingAddress');
      const billingAddressControl = this.checkOutFormGroup.get('billingAddress');
      billingAddressControl?.setValue(shippingAddressControl?.value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      const billingAddressControl = this.checkOutFormGroup.get('billingAddress');
      billingAddressControl?.reset();

      this.billingAddressStates = [];
    }
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkOutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log("This is the Code" + countryCode);

    this.checkoutFormService.getStatesFromCountryCode(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {

          this.shippingAddressStates = data;

        } else {
          this.billingAddressStates = data;
        }

        //select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );

  }

  get firstName() {
    return this.checkOutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkOutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkOutFormGroup.get('customer.email');
  }

  get shippingAddressCity() {
    return this.checkOutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressStreet() {
    return this.checkOutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressState() {
    return this.checkOutFormGroup.get('shippingAddress.state');
  }

  get shippingAddressCountry() {
    return this.checkOutFormGroup.get('shippingAddress.country');
  }

  get shippingAddressZipCode() {
    return this.checkOutFormGroup.get('shippingAddress.zipCode');
  }


  get billingAddressCity() {
    return this.checkOutFormGroup.get('billingAddress.city');
  }

  get billingAddressStreet() {
    return this.checkOutFormGroup.get('billingAddress.street');
  }

  get billingAddressState() {
    return this.checkOutFormGroup.get('billingAddress.state');
  }

  get billingAddressCountry() {
    return this.checkOutFormGroup.get('billingAddress.country');
  }

  get billingAddressZipCode() {
    return this.checkOutFormGroup.get('billingAddress.zipCode');
  }

  private reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    )
    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );
  }

  private setUpStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // create a card element
    this.cardElement = elements.create('card', {hidePostalCode: true});

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    //Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {

      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {

        this.displayError.textContent = "";

      } else {
        //show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });
  }
}
