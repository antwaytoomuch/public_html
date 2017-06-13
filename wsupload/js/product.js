// If Apple Pay is available (from both SW/HW perspective), display the Apple Pay button
document.addEventListener('DOMContentLoaded', () => {
	if (window.ApplePaySession) {
		// Below is the example of using CMPWAC
		var merchantIdentifier = 'merchant.com.example.warsawtest';
    	var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    	promise.then(function (canMakePayments) {
						if (canMakePayments){
							console.log("Im going to show apple pay button");
							showApplePayButton();
						}else {
							console.log("Im going to show Set up button");
							showApplePaySetUpButton();

						}
					}
				)
				.catch(function() {
					console.log("CMPWAC catch portion");
					console.log("Im going to show Set up button");
					showApplePaySetUpButton();
				})
	}
});

// This is where users can see & click the Set Up Pay button
function showApplePaySetUpButton(){
	var button = document.getElementsByClassName("apple-pay-set-up-button");
	console.log(button[0]);
	button[0].className += " visible";
}
var setUpListener = document.getElementsByClassName("apple-pay-set-up-button");
if(setUpListener[0]){
	try{
		setUpListener[0].addEventListener('click', setUpApplePay);
	} catch (e) {
		// ShowErrorAndRedirect(e);
		console.log(e);
	}
}else{
	console.log("no eventListener ID !!!");
}
function setUpApplePay(){
	console.log("I'm setting up Apple Pay");
	var merchantIdentifier = 'merchant.com.example.warsawtest';

	if (ApplePaySession.openPaymentSetup) {
		// Display the Set up Apple Pay Button here…
		ApplePaySession.openPaymentSetup(merchantIdentifier)
		 .then(function(success) {
			 if (success) {
				 // Open payment setup successful
				 console.log("setup successful");
			 } else {
				 console.log("setup failed");
			 }
		 })
		 .catch(function(e) {
			 console.log(e);
		 });
	}


}

// Below is the Apple Pay button part (buying with Apple Pay)
function showApplePayButton() {
	// HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	// var button = document.getElementsByClassName("apple-pay-button"); #backup
	var button = document.getElementsByClassName("apple-pay-button");
	console.log(button[0]);
	button[0].className += " visible";

    // This array is in the sample code, used to enable multiple AP buttons on the same page
	// for (let button of buttons) {
    // 	button.className += "visible";
	// }
}
// When the AP button is clicked
var el = document.getElementsByClassName("apple-pay-button");
if(el[0]){
	el[0].addEventListener('click', beginApplePay);
}else{
	console.log("no eventListener ID !!!");
}
// This is the function that handles AP session after clicking
function beginApplePay(){
    console.log("Apple Pay session begins...");
    const paymentRequest = {
      countryCode: 'TW',
  		currencyCode: 'TWD',
  		total: {
  			label: 'Apple Pay Example',
  			amount: '500.00',
  		},
  		supportedNetworks:[ 'masterCard', 'visa'],
  		merchantCapabilities: [ 'supports3DS' ],
  // 		requiredShippingContactFields: [ 'postalAddress', 'email' ],
  	};

  	const session = new ApplePaySession(1, paymentRequest);

	// Merchant Validation: Validate merchant URL & eligibility
	session.onvalidatemerchant = function(event) {
		console.log("Validate merchant now ");
		const validationURL = event.validationURL;
		console.log("validationURL is " + validationURL);
		getApplePaySession(event.validationURL).then(function(response) {
			console.log(response);
			session.completeMerchantValidation(response);
		});
	}
	function getApplePaySession(url) {
	  return new Promise(function (resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', 'getApplePaySession.php');
	     xhr.onload = function () {
			 if (this.status >= 200 && this.status < 300) {
				 console.log("return code -> " + this.status);
				//  console.log(xhr.response);
				 resolve(JSON.parse(xhr.response));
 			 } else {
				reject({
				  status: this.status,
				  statusText: xhr.statusText
				});
	      	}
	     };
	    xhr.onerror = function () {
	      reject({
	        status: this.status,
	        statusText: xhr.statusText
	      });
	    };
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.send(JSON.stringify({url: url}));
		// xhr.send();
	  });
	}

	// DO THIS 20170301 - TW
	// session.onpaymentmethodselected








    /*
	* Shipping Method Selection
	* If the user changes their chosen shipping method we need to recalculate
	* the total price. We can use the shipping method identifier to determine
	* which method was selected.
	*/
	session.onshippingmethodselected = (event) => {
		const shippingCost = event.shippingMethod.identifier === 'free' ? '0.00' : '5.00';
		const totalCost = event.shippingMethod.identifier === 'free' ? '8.99' : '13.99';

		const lineItems = [
			{
				label: 'Shipping',
				amount: shippingCost,
			},
		];
		const total = {
			label: 'Apple Pay Example',
			amount: totalCost,
		};
		session.completeShippingMethodSelection(ApplePaySession.STATUS_SUCCESS, total, lineItems);
	};

	/**
	* Payment Authorization
	* Here you receive the encrypted payment data. You would then send it
	* on to your payment provider for processing, and return an appropriate
	* status in session.completePayment()
	*/
    session.onpaymentauthorized = (event) => {
        // Send payment for processing...
        const payment = event.payment;

        // ...return a status and redirect to a confirmation page
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        window.location.href = "/success.html";
    }

    // All our handlers are setup - start the Apple Pay payment
    session.begin();
}
