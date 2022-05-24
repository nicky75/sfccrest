'use strict';

/**
 * @param {Object} object Object sent from controllers
 * Set service for create/edit/get prfile from third party
 * @returns {Object} - the jQuery / DOMElement
 */
function callProfileService(object) {
    var type = object.type;
    var profile = object.profile;
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var sendRequest = LocalServiceRegistry.createService('external.http.profiles', {
        createRequest: function (svc, params) {
            svc.setRequestMethod(type);
            svc.addHeader('Content-type', 'text/json');
            svc.addHeader('Accept', 'text/json');
            return JSON.stringify(params);
        },
        parseResponse: function (svc, client) {
            var status = client.statusCode;
            // data = JSON.parse(data);

            return status;
        },
        filterLogMessage: function (msg) {
            // return msg.replace(/\"cost_in_credits\"\:\"\d+\"/g, '"cost_in_credits":"$$"');
            return msg.replace(/\"password\"\:\".*?\"/, '"password":"******"');
        }
    });
    var req = { first_name: profile.firstName, last_name: profile.lastName, email: profile.email, phone: profile.phone, password: profile.password };
    var response = sendRequest.call(req);
    return response.object;
}

/**
 * @param {Object} object Object sent from controllers
 * Set service for create/edit/get prfile from third party
 * @returns {Object} - the jQuery / DOMElement
 */
function callAddresService(object) {
    var type = object.type;
    var address = object.address;
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var sendRequest = LocalServiceRegistry.createService('external.http.addresses', {
        createRequest: function (svc, params) {
            svc.setRequestMethod(type);
            svc.addHeader('Content-type', 'text/json');
            svc.addHeader('Accept', 'text/json');
            return JSON.stringify(params);
        },
        parseResponse: function (svc, client) {
            var status = client.statusCode;
            // data = JSON.parse(data);

            return status;
        }
    });
    var req = { address: address };
    var response = sendRequest.call(req);
    return response.object;
}

exports.callProfileService = callProfileService;
exports.callAddresService = callAddresService;
