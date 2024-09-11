import {Component, Inject, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../service/auth.service";
import {CustomValidator} from "../../../components/checkout/util/custom-validator";
import {AuthRequestBody} from "../../model/auth-request-body";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  authService: AuthService;

  loading: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router) {

    this.authService = inject(AuthService);

    this.loginForm = this.createForm();

  }

  private createForm(): FormGroup {
    return this.formBuilder.group({

      email: new FormControl('',
        [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), CustomValidator.notOnlyWhitespace]),

      password: new FormControl('',
        [Validators.required,
          Validators.minLength(6), CustomValidator.notOnlyWhitespace]),

    });

  }

  ngOnInit(): void {



  }

  onSubmit() {



    if (this.loginForm!.invalid) {
      this.loginForm!.markAllAsTouched();
      this.loading = false;
      return;
    }

    this.loading = true;

    let email = this.loginForm!.controls['email'].value;

    // console.log("===>>> Submit" + email);

    let password = this.loginForm!.controls['password'].value;

    let authReqBody = new AuthRequestBody();

    authReqBody.email = email;

    authReqBody.password = password;

    this.authService.authenticate(authReqBody).subscribe(
      {
        next: (response: any) => {
          // Handle the successful authentication response
          console.log('Authentication successful:', response);
          this.router.navigate(['/']).then();
        },
        error: (err: any) => {
          alert(`There was an error: ${err.message}`);
        },
      }
    )

    this.loading = false;
  }

  get email(){
    return this.loginForm?.get('email');
  }

  get password(){
    return this.loginForm?.get('password');
  }

  //TODO:
  // constructor(
  //   private router: Router,
  //   private accountService: AccountService
  // ) {
  //   // redirect to home if already logged in
  //   if (this.accountService.userValue) {
  //     this.router.navigate(['/']);
  //   }
  // }


}
