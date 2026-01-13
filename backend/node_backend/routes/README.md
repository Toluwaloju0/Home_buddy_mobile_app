this directory contains all the endpoints used on the site

the base URL is '/api/'

to authenticate a user and process logins the following endpoints are used

POST /auth/register - To register/create a new user
POST /auth/login - To login an already validated user
GET /auth/logout - To logout a user from the application

To perform CRUD operations for a user

GET /users/me - To get a user information
PUT /users/me/update - To update a user information
DELETE /users/me/delete - To delete a user from the database

