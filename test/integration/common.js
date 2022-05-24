var request = require('request-promise');
var config = require('./it.config');
var date = new Date();
var timestamp = date.getTime();

var constructRequest = function (testIP) {
    var cookieJar = request.jar();
    var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36';
    var myRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': userAgent
        }
    };

    if (testIP) {
        myRequest['testIP'] = testIP; // eslint-disable-line dot-notation
    }
    myRequest.url = config.baseUrl + '/CSRF-Generate';

    return myRequest;
};


var loginForm = function (csrfResponse, myRequest) {
    var csrfJsonResponse = JSON.parse(csrfResponse.body);
    myRequest.url = config.baseUrl + '/Account-Login?' // eslint-disable-line no-param-reassign
        + csrfJsonResponse.csrf.tokenName + '='
        + csrfJsonResponse.csrf.token;
    myRequest.form = { // eslint-disable-line no-param-reassign
        loginEmail: 'John' + timestamp + '@Doe.com',
        loginPassword: 'John' + timestamp + '@Doe.com',
        loginRememberMe: false
    };
};

var registerForm = function (csrfResponse, myRequest) {
    var csrfJsonResponse = JSON.parse(csrfResponse.body);

    myRequest.url = config.baseUrl + '/Account-SubmitRegistration?' // eslint-disable-line no-param-reassign
                    + csrfJsonResponse.csrf.tokenName + '='
                    + csrfJsonResponse.csrf.token;
    myRequest.form = { // eslint-disable-line no-param-reassign
        dwfrm_profile_customer_email: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_customer_emailconfirm: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_customer_firstname: 'John',
        dwfrm_profile_customer_lastname: 'Doe',
        dwfrm_profile_customer_phone: '9786543213',
        dwfrm_profile_login_password: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_login_passwordconfirm: 'John' + timestamp + '@Doe.com'
    };
};

var updateProfileForm = function (csrfResponse, myRequest) {
    var csrfJsonResponse = JSON.parse(csrfResponse.body);

    myRequest.url = config.baseUrl + '/Account-SaveProfile?' // eslint-disable-line no-param-reassign
        + csrfJsonResponse.csrf.tokenName + '='
        + csrfJsonResponse.csrf.token;
    myRequest.form = { // eslint-disable-line no-param-reassign
        dwfrm_profile_customer_email: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_customer_emailconfirm: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_customer_firstname: 'John1',
        dwfrm_profile_customer_lastname: 'Doe1',
        dwfrm_profile_customer_phone: '9786543213',
        dwfrm_profile_login_password: 'John' + timestamp + '@Doe.com',
        dwfrm_profile_login_passwordconfirm: 'John' + timestamp + '@Doe.com'
    };
};

var updateAddressForm = function (csrfResponse, myRequest) {
    var csrfJsonResponse = JSON.parse(csrfResponse.body);

    myRequest.url = config.baseUrl + '/Address-SaveAddress?' // eslint-disable-line no-param-reassign
        + csrfJsonResponse.csrf.tokenName + '='
        + csrfJsonResponse.csrf.token;
    myRequest.form = { // eslint-disable-line no-param-reassign
        dwfrm_address_addressId: 'Test Address',
        dwfrm_address_firstName: 'User',
        dwfrm_address_lastName: 'Test3',
        dwfrm_address_address1: 'Test Street 10',
        dwfrm_address_country: 'US',
        dwfrm_address_states_stateCode: 'MA',
        dwfrm_address_city: 'Boston',
        dwfrm_address_postalCode: '02111',
        dwfrm_address_phone: '9234567890'
    };
};

exports.constructRequest = constructRequest;
exports.loginForm = loginForm;
exports.updateProfileForm = updateProfileForm;
exports.updateAddressForm = updateAddressForm;
exports.registerForm = registerForm;
