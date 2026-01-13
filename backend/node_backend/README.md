This is the backend repo for the `HOMEBUDDY MOBILE APP` it can be used in the following ways

upgrade and update your terminal using
`sudo apt update && sudo apt -y upgrade`

install javascript, node and npm via the instructions at
`https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/`

Open a Linux terminal and import the repository from GitHub using the necessary commands

cd into the repo and into the directory called `api`

run the following commands
`npm i`
`npm run dev`

The API contains the following endpoints which can all be accessed from localhost using http://localhost:8800/api/

/auth : the endpoint for authentications
    /register : To register a new user in the database
        request body must include `email, password, username`
        returns a message of confirmation of user creation and a cookie secure token for other purposes

    /login : To log a user in to the system
        request body must include `email, password`
        returns a message of confirmation if log in is successful and a cookie secure token for other purposes

    /logout
        removes the secure token in the cookie

/user : the endpoint which allows a user to manage his account
    /personal : to get the user informations in the database
        uses the cookie token in the sent during login
        returns the information of the user as saved in the database
    
    /personal/update : updates the user information in the database with new values
        uses the cookie token gotten from login and the values to update in the request body
        returns a message of successful update

    /personal/delete : deletes a user from the database
        uses the cookie token gotten from login
        deletes the user and returns nothing
