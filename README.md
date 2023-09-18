# In-App Calling Dialpad

 # Table of Contents

* [Description](#description)
* [Pre-Requisites](#pre-requisites)
* [Running the Application](#running-the-application)
* [Environmental Variables](#environmental-variables)

# Description

A simple dial pad application used to create calls using our WebRTC SDK.

# Pre-Requisites

In order to use this sample app, your account must have In-App Calling enabled. You will also have to generate an auth token using our Identity API.

For more information about API credentials see our [Account Credentials](https://dev.bandwidth.com/docs/account/credentials) page.

# Running the Application

Use the following command/s to run the application:

```sh
yarn start
```

# Environmental Variables

The sample app uses the below environmental variables.

```sh
REACT_APP_IN_APP_CALLING_TOKEN             # You Identity Token
REACT_APP_IN_APP_CALLING_NUMBER            # A valid phone number on your account
```
