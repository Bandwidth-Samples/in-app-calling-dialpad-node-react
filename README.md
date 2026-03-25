# In-App Calling Dialpad

# Table of Contents

- [Description](#description)
- [Pre-Requisites](#pre-requisites)
- [Initialization](#initialization)
- [Running the Application](#running-the-application)

# Description

A simple dial pad application used to create calls using our WebRTC SDK.

# Pre-Requisites

In order to use this sample app, your account must have In-App Calling enabled. You will also have to generate an auth token using our Identity API.

For more information about API credentials see our [Account Credentials](https://dev.bandwidth.com/docs/account/credentials) page.

### Environment Setup

1. Copy the example environment file:

```sh
cp .env.example .env
```

2. Fill in your values in `.env`:

```sh
REACT_APP_ACCOUNT_ID=              # Your Bandwidth account ID
REACT_APP_AUTH_TOKEN=              # Your OAuth / Identity token
REACT_APP_ACCOUNT_USERNAME=        # Source phone number (e.g. +15551234567)
```

Optional overrides (uncomment in `.env` if needed):

```sh
# REACT_APP_GATEWAY_URL=           # Override the WebRTC gateway WebSocket URL
# REACT_APP_HTTP_BASE_URL=         # Override the Bandwidth REST API base URL
# REACT_APP_EVENT_CALLBACK_URL=    # Event callback URL for inbound call notifications
```

# Initialization

- **BandwidthUA**: The instance is available from the outset. Initialization is required before making a call. Follow the below code snippet for initialization:

```js
import { BandwidthUA } from "@bandwidth/bw-webrtc-sdk";

const phone = new BandwidthUA({
  accountId: accountId,
});

phone.checkAvailableDevices();
phone.setAccount(`${sourceNumber}`, "In-App Calling Sample", "");
phone.setOAuthToken(authToken);
await phone.init();
```

> **Note:** In v1.2.0, `setServerConfig()` is no longer required. The SDK connects directly to the Bandwidth WebRTC backend. The only new requirement is passing `accountId` in the constructor. See the [SDK README](https://github.com/Bandwidth/javascript-webrtc-sdk#migration-from-v11x) for migration details.

# Usage

### Making a Call

Making a call using the Bandwidth services involves a series of steps to ensure the call's proper initiation and management.

```js
const activeCall = await phone.makeCall(`${destNumber}`, extraHeaders);
```

Keep the `activeCall` instance in persistent state in order to reuse this instance for call termination, hold & mute.

### Terminating a Call

```js
activeCall.terminate();
```

This method is responsible for correctly signaling the termination of the call session. After invoking this method, it's a good practice to handle UI transitions and take any other post-call actions that may be necessary in your application's context.

### Listeners and Implementation

Listeners are pivotal in monitoring and responding to real-time events during the call.

In the provided code, the `BandwidthUA.setListeners` is used. This listener has multiple callback methods.

**Implementation**:

To use the listener, you implement it as an anonymous class and provide logic inside each method:

```js
phone.setListeners({
  loginStateChanged: function (isLogin, cause) {
    console.log(cause);
    switch (cause) {
      case "connected":
        console.log("phone>>> loginStateChanged: connected");
        break;
      case "disconnected":
        console.log("phone>>> loginStateChanged: disconnected");
        break;
      case "login failed":
        console.log("phone>>> loginStateChanged: login failed");
        break;
      case "login":
        console.log("phone>>> loginStateChanged: login");
        break;
      case "logout":
        console.log("phone>>> loginStateChanged: logout");
        break;
    }
  },

  outgoingCallProgress: function (call, response) {
    console.log("phone>>> outgoing call progress");
  },

  callTerminated: function (call, message, cause) {
    console.log(`phone>>> call terminated callback, cause=${cause}`);
  },

  callConfirmed: function (call, message, cause) {
    console.log("phone>>> callConfirmed");
  },

  callShowStreams: function (call, localStream, remoteStream) {
    console.log("phone>>> callShowStreams");
    let remoteVideo = document.getElementById("remote-video-container");
    if (remoteVideo != undefined) {
      remoteVideo.srcObject = remoteStream;
    }
  },

  incomingCall: function (call, invite) {
    console.log("phone>>> incomingCall");
  },

  callHoldStateChanged: function (call, isHold, isRemote) {
    console.log(
      `phone>>> callHoldStateChanged to ${isHold ? "hold" : "unhold"}`
    );
  },
});
```

### Configuring Inbound Calls

- **Overview:** We have used two major capabilities to make the inbound call

  - Caller to Callee & Callback from Callee to Caller
  - Bridging the both calls to connect caller and callee in a single call

- **Sequence Diagram:** Follow sequence diagram to implement the in call using the SDK
  ![InboundFLow](bandwidth-inbound-react.drawio.svg)

- **Notification Handler Service Sample:**
  https://github.com/Bandwidth-Samples/in-app-calling-inbound-demo

# Running the Application

Use the following command to run the application:

```sh
npm start
```

# Error Handling

Errors, especially in networked operations, are inevitable. Ensure you catch, manage, and inform users about these, fostering a seamless experience.
