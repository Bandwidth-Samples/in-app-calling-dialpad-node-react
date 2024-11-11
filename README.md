# In-App Calling Dialpad

 # Table of Contents

* [Description](#description)
* [Pre-Requisites](#pre-requisites)
* [Initialization](#initialization)
* [Running the Application](#running-the-application)

# Description

A simple dial pad application used to create calls using our WebRTC SDK.

# Pre-Requisites

In order to use this sample app, your account must have In-App Calling enabled. You will also have to generate an auth token using our Identity API.

For more information about API credentials see our [Account Credentials](https://dev.bandwidth.com/docs/account/credentials) page.

### Environmental Variables

The sample app uses the below environmental variables.

```sh
REACT_APP_IN_APP_CALLING_TOKEN             # You Identity Token
REACT_APP_ACCOUNT_USERNAME                 # Put from number here
REACT_APP_ACCOUNT_DISPLAY_NAME             # Put from number/display name here
REACT_APP_ACCOUNT_PASSWORD                 # use some password or leave it empty
```

# Initialization

- **BandwidthUA**: The instance is available from the outset, Initialization required before making the call, follow the below code snippet for initialization
```sh 
const serverConfig = {
      domain: 'gw.webrtc-app.bandwidth.com',
      addresses: ['wss://gw.webrtc-app.bandwidth.com:10081'],
      iceServers: [
        'stun.l.google.com:19302',
        'stun1.l.google.com:19302',
        'stun2.l.google.com:19302',
      ],
};
const phone = new BandwidthUA();

phone.setServerConfig(
      serverConfig.addresses,
      serverConfig.domain,
      serverConfig.iceServers
);
phone.checkAvailableDevices();
phone.setAccount(`${sourceNumber}`, 'In-App Calling Sample', '');
phone.setOAuthToken(authToken);
phone.init();
```

# Usage

### Making a Call

Making a call using the Bandwidth services involves a series of steps to ensure the call's proper initiation and management.

```sh
var activeCall = phone.call('+${destNumber}')
```

Keep the `activeCall` instance global in persistant state in order to reuse this instance for call termination, hold & mute.
### Terminating a Call

```sh
activeCall.terminate();
```

This method is responsible for correctly signaling the termination of the call session. After invoking this method, it's a good practice to handle UI transitions and take any other post-call actions that may be necessary in your application's context.

### Listeners and Implementation

Listeners are pivotal in monitoring and responding to real-time events during the call.

In the provided code, the `BandwidthUA.setListeners` is used. This listener has multiple callback methods.

**Implementation**:

To use the listener, you implement it as an anonymous class and provide logic inside each method:

```sh
phone.setListeners({
      loginStateChanged: function (isLogin, cause) {
        console.log(cause);
        switch ('cause' + cause) {
          case 'connected':
            console.log('phone>>> loginStateChanged: connected');
            break;
          case 'disconnected':
            console.log('phone>>> loginStateChanged: disconnected');            
            break;
          case 'login failed':
            console.log('phone>>> loginStateChanged: login failed');
            break;
          case 'login':
            console.log('phone>>> loginStateChanged: login');
            break;
          case 'logout':
            console.log('phone>>> loginStateChanged: logout');
            break;
        }
      },

      outgoingCallProgress: function (call, response) {
        updateFBStatus("Call-Initiate");
        console.log('phone>>> outgoing call progress');
      },

      callTerminated: function (call, message, cause) {
        console.log(`phone>>> call terminated callback, cause=${cause}`);
      },

      callConfirmed: function (call, message, cause) {
        console.log('phone>>> callConfirmed');
      },

      callShowStreams: function (call, localStream, remoteStream) {
        console.log('phone>>> callShowStreams');
        let remoteVideo = document.getElementById('remote-video-container');
        if (remoteVideo != undefined) {
          remoteVideo.srcObject = remoteStream;
        }
      },

      incomingCall: function (call, invite) {
        console.log('phone>>> incomingCall');
      },

      callHoldStateChanged: function (call, isHold, isRemote) {
        console.log(`phone>>> callHoldStateChanged to ${isHold ? 'hold' : 'unhold'} `);
      }
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

Use the following command/s to run the application:

```sh
yarn start
```

# Error Handling

Errors, especially in networked operations, are inevitable. Ensure you catch, manage, and inform users about these, fostering a seamless experience.
