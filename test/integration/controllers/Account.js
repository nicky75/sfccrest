var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var common = require('../common');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

/**
 * Test case:
 * should be able to register, logout, login, update profile
 */

describe('Customer register and edit', function () {
    this.timeout(50000);

    var registerAssert = function (myRequest) {
        return request(myRequest)
            .then(function () {
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                common.registerForm(csrfResponse, myRequest);

                return request(myRequest)
                    .then(function (response) {
                        var bodyAsJson = JSON.parse(response.body);
                        assert.equal(bodyAsJson.success, true);
                    });
            });
    };

    var loginAndUpdateAssert = function (myRequest) {
        return request(myRequest)
            .then(function () {
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                common.loginForm(csrfResponse, myRequest);
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate'; // eslint-disable-line no-param-reassign
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                common.updateProfileForm(csrfResponse, myRequest);

                return request(myRequest)
                    .then(function (response) {
                        var bodyAsJson = JSON.parse(response.body);
                        assert.equal(bodyAsJson.success, true);
                        assert.equal(bodyAsJson.firstName, 'John1');
                        assert.equal(bodyAsJson.lastName, 'Doe1');
                    });
            });
    };

    it('should register', function () {
        var myRequest = common.constructRequest();
        return registerAssert(myRequest);
    });

    it('should login and edit profile', function () {
        var myRequest = common.constructRequest();
        return loginAndUpdateAssert(myRequest);
    });
});
