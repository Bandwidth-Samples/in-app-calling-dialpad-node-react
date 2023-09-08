import React, { useEffect, useState } from "react";
import { useAuthenticationToken } from "../hooks/useInAppCallingToken";
import { BandwidthUA } from "@bandwidth/bw-webrtc-sdk";
import DialPad from "./DialPad";
import { Grid, Typography, Box, Tooltip, Snackbar, Alert } from "@bw/foundry";

function InAppCalling() {
  const authToken = useAuthenticationToken();
  const [phone, setPhone] = useState(new BandwidthUA());
  const [activeCall, setActiveCall] = useState(null);

  const [alert, setAlert] = useState({ alert: false, severity: "error", alertText: "" });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const serverConfig = {
      domain: "sbc.webrtc-app.bandwidth.com",
      addresses: ["wss://sbc.webrtc-app.bandwidth.com:10081"],
      iceServers: [
        "stun.l.google.com:19302",
        "stun1.l.google.com:19302",
        "stun2.l.google.com:19302",
      ],
    };
    const newPhone = new BandwidthUA();

    newPhone.setServerConfig(
      serverConfig.addresses,
      serverConfig.domain,
      serverConfig.iceServers
    );
    newPhone.setOAuthToken(authToken);
    setPhone(newPhone);
  },[authToken]);

  useEffect(() => {
    phone.setListeners({
      loginStateChanged: function (isLogin, cause) {
        // eslint-disable-next-line default-case
        switch (cause) {
          case "connected":
            console.log("phone>>> loginStateChanged: connected");
          
            setAlert({ alert: true, severity: "success", alertText: "Connected to WebRTC Service" });
           

            break;
          case "disconnected":
            console.log("phone>>> loginStateChanged: disconnected");
            if (phone.isInitialized())
              // after deinit() phone will disconnect SBC.
              console.log("Cannot connect to SBC server");
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
        setDisabled(true);
        if (call !== activeCall) {
          console.log("terminated no active call");
          return;
        }
        setActiveCall(null);
        console.log("Call terminated: " + cause);

        console.log("call_terminated_panel");
      },

      callConfirmed: function (call, message, cause) {
        console.log("phone>>> callConfirmed");
        setDisabled(false);
        let remoteVideo = document.getElementById("remote_video");
        let vs = remoteVideo.style;
        vs.display = "block";
        vs.width = vs.height = call.hasReceiveVideo() ? "auto" : 0;
      },

      callShowStreams: function (call, localStream, remoteStream) {
        console.log("phone>>> callShowStreams");
        let remoteVideo = document.getElementById("remote_video");
        remoteVideo.srcObject = remoteStream; // to play audio and optional video
      },

      incomingCall: function (call, invite) {
        console.log("phone>>> incomingCall");
        call.reject();
      },

      callHoldStateChanged: function (call, isHold, isRemote) {
        console.log(
          //   deepcode ignore AmbiguousConditional: <please specify a reason of ignoring this>
          "phone>>> callHoldStateChanged " + isHold ? "hold" : "unhold"
        );
      },
    });
  }, [phone, activeCall]);

  useEffect(() => {
    async function connect() {
      await phone.checkAvailableDevices();
      phone.setAccount("+441138688226", "Tac - Lab", "");
      await phone.init();
    }
    connect();
  }, []);

  useEffect(() => {
    if (phoneNumber.length > 7) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    return () => {
      phone.deinit();
    };
  }, []);

  const callOutboundPhoneNumber = async () => {
    if (phone.isInitialized()) {
      setActiveCall(phone.call(`+${phoneNumber}`));
      setDisabled(false);
    } else {
      setAlert({ alert: true, severity: "error" , alertText: "WebRTC service is disconnected, please try again"});
    }
  };

  const disconnect = () => {
    if (activeCall) {
      activeCall.terminate();
      setDisabled(true);
    } else {
      setAlert({ alert: true, severity: "error", alertText: "There is no call to end.... you ok BRUH?!?!" });
    }
  };

  const sendDTMF = (value) => {
    if(activeCall){
      console.log('sending dtmf' + value)
      activeCall.sendDTMF(value)
    }
   }
  

  return (
    <Grid container>
      <Grid item display={"flex"} justifyContent={"center"} sm={10} md={10}>
        <div className="App">
          <Typography sx={{ m: "3rem" }} variant="h1">
            In-App-Calling (Global)
          </Typography>
          <Typography sx={{ m: "3rem" }} variant="h4">
            (Click to Call - WebRTC)
          </Typography>
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Tooltip
              placement="right"
              title="This tools uses the Bandwidth In app calling SDK. Please make sure to add the country code to the number you're dialing, the + is not necessary. Calls are coming from our BWI account at +44 113 868 8226"
              interactive="true"
            />
          </Box>
          <Snackbar
            open={alert.alert}
            onClose={() => {
              setAlert({ alert: false, severity: alert.severity, alertText: "" });
            }}
          >
            <Alert severity={alert.severity}>{alert.alertText}</Alert>
          </Snackbar>
          <Grid item display={"flex"} justifyContent={"center"} s={10} m={10}>
            <DialPad
              onCallClick={callOutboundPhoneNumber}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              disconnect={disconnect}
              disabled={disabled}
              spoofOrType={false} // Telling the dialpad component not to render on/offnet options as well as the ability to spoof
              activeCall={activeCall}
             
            />
          </Grid>
          <video
            id="remote_video"
            playsInline
            autoPlay
            style={{ display: "none" }}
          ></video>
        </div>
      </Grid>
    </Grid>
  );
}
export default InAppCalling;
