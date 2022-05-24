# Build External REST Service

​Task: Build an external REST service with a database, which to GET, CREATE and UPDATE the data provided by the client. 

Solution:
- Customer data is stored in an external database. Service external.http.profiles is contacting the external database. Custom controller is doing prepend for Account-SubmitRegistration and replace for Account-SaveProfile
- Address data is stored in an external database and checked before doing insert/update with the service external.http.addresses. Custom controller is doing replace for Address-SaveAddress
- Added log file, where sensitive data is hidden
- Added integration test for registration, login, update and addition of a new address
