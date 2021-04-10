# finance_discount_system
this repository includes a node js server code that uses PostgreSQL database and EXPRESS JS
the API's purpose is to specify whether a product has a discount for the specified company and user and discount code (if received)

# running the code
to run please do the following steps:
1. clone the repository on your system
2. make sure your PostgreSQL is connected
3. import the database in /dump folder in your PostgreSQL server
4. enter your database info in the configuration file (/config/config.env) 
5. install dependencies by running `npm install` in the project folder's terminal
6. to run the server you can run the default file /bin/www or /app.js or running `npm run start` in terminal

to use the API please refer to the postman document in /document folder

the default company username=company1 password=123321

# structure
the server has (model/controller/view) structure as described below:
1. model:
  retrieves, inserts, and edits the data in the database
  it doesn't have logical concepts
  every model represents a table in the database
  every model has a populate method, this method is concerned with populating a valid object of the database record
  why use populate methods?
  when using joined queries the populate methods combined with the build-in javascript methods such as map makes dividing the retrieved data easier and more efficient
  models don't have import statements, any method outside method needed is passed in the local method's parameters
3. controller:
  controllers contain the logical code behind the API routes.
  all methods in controllers have two input parameters (req, res)
  methods in controllers are not concerned with security formalities and only validate the inputs (when a resource is not allowed the code doesn't reach the controller level)
  a controller can only import models and packages
5. view: 
  views can be found in the/routes folder since the API is a JSON API and doesn't use EJS responses.
  views can import controllers and models although the model imports are done at the controller level.
  views consider the security formalities, each route is required to check the security issues before proceeding to the controller.

this structure ensures that no dependency loops occurs

# folders
1. bin
  contains the www file to run the server
3. classes
  contains the classes used in the server:
  a. ErrorClass.js is a customized error for validation errors
  b. InputCondition.js is a customized class for validating input received from the user
5. config
  a. config.env contains server configuration
  b. db.js contains database connection methods (the database connection in PostgreSQL is easy. however, in order to read the same configuration this file was included)
  c. error.js contains error configurations (an object built for error handling purposes)
7. controllers
  contains controllers
9. loaders
  contains server loaders
  a. ConfigLoader.js divides the script used to run the server into several methods (to simplify the code in app.js) and loads the variables in config.env into a global object.
    Why use the global object for configuration?
    it is easier to use and this way when using config variables auto-complete and error detection is enabled
  b. RoutesLoader.js
11. methods
  a. RequestMethods.js: to create a template that is always applied when sending a response to the user these methods were created.
    callbackResponse: this method generates the response, every response has 2 variables in its body: (success: boolean, data: any or message: string)
  b. validateInput
    validates input using an array of InputConditions
13. models
  contain models
15. public
17. routes
 contain routes
19. security
 contains security files such as a private key for JWTtoken  generation
21. views
22. dumps
23. documents

# logic
the main purpose of the API is to determine whether a given product has a discount (based on product/category priority, company, user, and payment amount)
  
factors: [company]
use cases:
  1. company logs in to receive JWTtoken (/auth/login)
    the login uses basic auth, the token returned is signed by an SSH-1(RSA) private key.
  3. company checks the product discount (/finance/discount)
    uses bearer token that contains the JWTtoken received on the login
  5. company vies all the product/category chains and the discount percents applied to each node in the chains (/product/tree)
    uses bearer token that contains the JWTtoken  received on the login

P.S: there is no API to modify and manage data, to add or modify models data should be added directly into the database
P.S: the database backup in dups includes the test records

checking discount algorithm:
the server has two kinds of discounts
1. global discount assigned to product/category, applies to any payment for given product and product's category chain (if exists)
  a global discount has an expiration date and only discounts with valid expiration dates will be applied
3. discount code which is entered by the user (if a discount code was received the server checks the discount codes and global discounts otherwise only check global discounts)
  a. a discount code can be defined for a specific company (when company_id is null the code applies to all companies)
  b. a discount code can be defined for a specific customer (when customer_id is null the code applies to all customers)
  c. a discount code has an expiration date
  d. a discount code is bound to a specific product/category
  e. a discount code has a minimum amount (when the minimum amount is bigger than the factor amount the discount code won't apply)
  e. a discount code is unique for its reference, in other discount code 'testCode1' can apply 30% discount for category1 but 40% discount for product3

when checking the availability of the discount
1. global discount:
  when checking for global discounts the server gives higher priority to the discount applied to the product than its parent category and so on
  when more than one discount is found for the given product/category chain the server applies the lower level discount.
  only one discount code can be applied to a product/category.
  a global discount can be applied to more than one product/category (1-n connection).
2. discount code: 
  when checking for discount codes the server gives higher priority to the discount applied to the product than its parent category and so on.
  when more than one discount is found for the given product/category chain the server applies the discount code that fits the input given at the lowest level of the chain
  the discount_code product/category connection is (1-1)

the result discount percent is:
if(no discounts found) returns -1 
if(sum =< 100) returns discount_code.discountPercent + global_discount.sidcount_percent 
otherwise returns 100
  
  
