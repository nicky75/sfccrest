var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var common = require('../common');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Address edit', function () {
    this.timeout(50000);

    var loginAndUpdateAddressAssert = function (myRequest) {
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
                common.updateAddressForm(csrfResponse, myRequest);

                return request(myRequest)
                    .then(function (response) {
                        var bodyAsJson = JSON.parse(response.body);
                        assert.equal(bodyAsJson.success, true);
                        assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                        assert.equal(bodyAsJson.addressId, 'Test Address', 'Expected address title to be updated.');
                    });
            });
    };

    it('should login and add address', function () {
        var myRequest = common.constructRequest();
        return loginAndUpdateAddressAssert(myRequest);
    });
});
