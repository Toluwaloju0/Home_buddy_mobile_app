Home Buddy Connect Limited

A modern real estate platform that helps users easily search, buy, sell, and manage properties. The website connects buyers, sellers, and agents while providing tools for property listings, price insights, and seamless house-related services.

-On your terminal clone the github repo using the command 
    `git clone https://github.com/Toluwaloju0/Home_buddy_mobile_app.git`

-Change the directory to the backend using the command
    `cd Home_buddy_mobile_app/backend/v1`

-install mongo server on your terminal by using the instructions at the site
    https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04 - for ubuntu terminal or visit
    https://www.mongodb.com/docs/manual/installation/ - and pick your OS type

-Install python3, python3-venv, python3-pip
    `sudo apt update && sudo apt upgrade -y`
    `sudo apt install python3 python3-pip python3-venv`

-create a start virtual environment using the command
    `python3 -m venv .venv`
    `source .venv/bin/activate`

-Install all neccesary dependencies
    `pip3 install -r requirements.txt`

-Copy .env.example to .env file and edit the file providing the needed keys
    `cp .env.example .env`

-Run the backend on the port provided on the .env file
    `python3 main.py`

The following endpoints are available on the backend
    POST /auth/login - logs new and old users into the app
    POST /auth/logout - logs all users out of the app
    GET /auth/token/refresh - resets the access token in the cookie
    POST /auth/otp/verify - verifies the provided otp code
    GET /auth/otp/refresh - sends a new otp code to the user
    GET /user/me - gets a user information
    DELETE /user/me - user deletes his information
    PATCH /user/me/password - user updates his password
    PATCH /user/me/email - user updates his email
    PUT /user/me/update - user updates his provided information
    

for more info email me at tolukayode2017@gmail.com