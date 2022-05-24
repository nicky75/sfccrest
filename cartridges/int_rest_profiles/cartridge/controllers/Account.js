'use strict';

/**
 * @namespace Home
 */

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');

var server = require('server');
var page = module.superModule;
var restServiceHelper = require('*/cartridge/scripts/helpers/externalRestService');
server.extend(page);

/**
 * Extends the base Account-SubmitRegistration controller route in order send
 * data to external API to save.
 */
server.prepend(
    'SubmitRegistration',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    /**
     * @param {Object} req - The standard SFRA HTTP request wrapper Object.
     * @param {Object} res - The standard SFRA HTTP response wrapper Object.
     * @param {Function} next - The next function in the middleware chain.
     * @return {void}
     */
    function (req, res, next) {
        this.on('route:BeforeComplete', function (req, res) {
            var registrationForm = res.getViewData(); // eslint-disable-line

            if (registrationForm.validForm) {
                var obj = { type: 'POST', profile: registrationForm };
                var checkExternalService = restServiceHelper.callProfileService(obj);
                if (empty(checkExternalService) ||
                    checkExternalService === 500
                ) {
                    // Force an error to keep SFRA from creating account.
                    registrationForm.validForm = false;
                    res.setViewData(registrationForm);
                    res.setStatusCode(500);
                    res.json({
                        success: false,
                        errorMessage: Resource.msg(
                            'error.message.unable.to.create.account',
                            'external', null)
                    });

                    return;
                }
            }
        });
        return next();
    }
);

/**
 * Account-SaveProfile : The Account-SaveProfile endpoint is the endpoint that gets hit when a shopper has edited their profile
 * @name Base/Account-SaveProfile
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password  - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensititve
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    'SaveProfile',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require('dw/system/Transaction');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

        var formErrors = require('*/cartridge/scripts/formErrors');

        var profileForm = server.forms.getForm('profile');

        // form validation
        if (profileForm.customer.email.value.toLowerCase()
            !== profileForm.customer.emailconfirm.value.toLowerCase()) {
            profileForm.valid = false;
            profileForm.customer.email.valid = false;
            profileForm.customer.emailconfirm.valid = false;
            profileForm.customer.emailconfirm.error =
                Resource.msg('error.message.mismatch.email', 'forms', null);
        }

        var result = {
            firstName: profileForm.customer.firstname.value,
            lastName: profileForm.customer.lastname.value,
            phone: profileForm.customer.phone.value,
            email: profileForm.customer.email.value,
            confirmEmail: profileForm.customer.emailconfirm.value,
            password: profileForm.login.password.value,
            profileForm: profileForm
        };
        if (profileForm.valid) {
            res.setViewData(result);
            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var profile = customer.getProfile();
                var customerLogin;
                var status;

                Transaction.wrap(function () {
                    status = profile.credentials.setPassword(
                        formInfo.password,
                        formInfo.password,
                        true
                    );

                    if (status.error) {
                        formInfo.profileForm.login.password.valid = false;
                        formInfo.profileForm.login.password.error =
                            Resource.msg('error.message.currentpasswordnomatch', 'forms', null);
                    } else {
                        customerLogin = profile.credentials.setLogin(
                            formInfo.email,
                            formInfo.password
                        );
                    }
                });

                delete formInfo.password;
                delete formInfo.confirmEmail;

                if (customerLogin) {
                    var obj = { type: 'PUT', profile: formInfo };
                    var checkExternalService = restServiceHelper.callProfileService(obj);
                    if (empty(checkExternalService) || checkExternalService === 500
                    ) {
                        formInfo.profileForm.customer.firstname.valid = false;
                        formInfo.profileForm.customer.firstname.error =
                            Resource.msg('error.message.unable.to.update.account', 'account', null);

                        delete formInfo.profileForm;
                        delete formInfo.email;
                        res.json({
                            success: false,
                            fields: formErrors.getFormErrors(profileForm)
                        });

                        // res.setViewData(profileForm);
                        // res.setStatusCode(500);
                        // res.json({
                        //     success: false,
                        //     errorMessage: Resource.msg('error.message.unable.to.create.account', 'login', null)
                        // });

                        return;
                    }
                    Transaction.wrap(function () {
                        profile.setFirstName(formInfo.firstName);
                        profile.setLastName(formInfo.lastName);
                        profile.setEmail(formInfo.email);
                        profile.setPhoneHome(formInfo.phone);
                    });

                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    delete formInfo.profileForm;
                    delete formInfo.email;

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Account-Show').toString()
                    });
                } else {
                    if (!status.error) {
                        formInfo.profileForm.customer.email.valid = false;
                        formInfo.profileForm.customer.email.error =
                            Resource.msg('error.message.username.invalid', 'forms', null);
                    }

                    delete formInfo.profileForm;
                    delete formInfo.email;

                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(profileForm)
                    });
                }
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(profileForm)
            });
        }
        return next();
    }
);

module.exports = server.exports();
