# In-App Calling Dialpad

A simple dial pad application used to create calls using the Bandwidth WebRTC SDK.

## Table of Contents

* [Description](#description)
* [Pre-Requisites](#pre-requisites)
* [Setup](#setup)
* [Running the Application](#running-the-application)
* [SDK Documentation](#sdk-documentation)

## Description

This sample app demonstrates how to build a simple dialing interface with the Bandwidth WebRTC SDK. It includes call controls for mute, hold, and hangup functionality.

## Pre-Requisites

Your account must have In-App Calling enabled. For more information about API credentials, see the [Account Credentials](https://dev.bandwidth.com/docs/account/credentials) page.

You'll need a Signum JWT token (OAuth token) to authenticate with the SDK. The SDK now extracts your `accountId` from the JWT claims automatically.

## Setup

```sh
cp .env.example .env
```

Edit `.env` and populate:

```sh
REACT_APP_ACCOUNT_ID=<your-account-id>
REACT_APP_ACCOUNT_USERNAME=<source-phone-number>
REACT_APP_AUTH_TOKEN=<your-signum-jwt-token>
```

## Running the Application

```sh
npm install
npm start
```

The app will open at `http://localhost:3000`.

## SDK Documentation

For detailed SDK usage and API documentation, refer to the [Bandwidth WebRTC SDK documentation](https://dev.bandwidth.com/sdks/webrtc/).

## Error Handling

Errors are logged to the console. Ensure that your environment variables are correctly set and that your account has In-App Calling enabled.
