import React, { useCallback, useEffect, useState } from 'react';
import '../css/DialPad.css';
import Digit from './Digit';
import SingleLineInput from './SingleLineInput';
import IconButton from "@mui/material/IconButton";
import WifiCallingIcon from "@mui/icons-material/WifiCalling";
import CallEndIcon from "@mui/icons-material/CallEnd";
import BackspaceIcon from '@mui/icons-material/Backspace';
import { BandwidthUA } from "@bandwidth/bw-webrtc-sdk";
import { useStopwatch } from 'react-timer-hook';

export default function DialPad() {
  const authToken = process.env.REACT_APP_IN_APP_CALLING_TOKEN;
  const defaultSourceNumber = process.env.REACT_APP_IN_APP_CALLING_NUMBER;
  const destinationNumberNote = "Call international or domestic. Include area code and country code, but don't add the '+'";
  const sourceNumberNote = "Enter a number on your BW account. Include area code and country code, but don't add the '+'";
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });

  const [destNumber, setDestNumber] = useState('');
  const [sourceNumber, setSourceNumber] = useState(`${defaultSourceNumber}`);
  const [destNumberValid, setDestNumberValid] = useState(false);
  const [allowHangup, setAllowHangup] = useState(false);
  const [phone, setPhone] = useState(new BandwidthUA());
  const [activeCall, setActiveCall] = useState(null);
  const [webrtcStatus, setWebrtcStatus] = useState({ color: 'var(--blue50)', text: 'Connecting to WebRTC Service' });

  useEffect(() => {
    const serverConfig = {
      domain: "gw.webrtc-app.bandwidth.com",
      addresses: ["wss://gw.webrtc-app.bandwidth.com:10081"],
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
        switch ('cause' + cause) {
          case "connected":
            console.log("phone>>> loginStateChanged: connected");
            setWebrtcStatus({ color: 'var(--green50)', text: "Connected to WebRTC Service" });
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
        setAllowHangup(false);
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
        setAllowHangup(true);
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
      phone.setAccount(`+${sourceNumber}`, 'In-App Calling Sample', '');
      await phone.init();
    }
    connect();
  }, [sourceNumber]);

  useEffect(() => {
    return () => {
      phone.deinit();
    };
  }, []);

  useEffect(() => {
    if (destNumber.length > 7) {
      setDestNumberValid(true);
    } else {
      setDestNumberValid(false);
    }
  }, [destNumber]);

  useEffect(() => {
    if (activeCall === null) { pause() }
  }, [activeCall]);
  
  const handleDigitClick = useCallback(
    (value) => (event) => {
      if (activeCall) {
        activeCall.sendDTMF(value)
      }
      else {
        setDestNumber((destNumber) => destNumber.concat(value));
      }
    },
    [activeCall]
  );

  const handleDestNumberInput = (e) => {
    setDestNumber(e.target.value.replace(/\D/g, ""));
  };

  const handleSourceNumberInput = (e) => {
    setSourceNumber(e.target.value.replace(/\D/g, ""));
  };

  const handleBackspaceClick = () => {
    setDestNumber((destNumber) => destNumber.slice(0, -1));
  };

  const handleDialClick = () => {
    if (phone.isInitialized()) {
      setActiveCall(phone.call(`+${destNumber}`));
      setAllowHangup(true);
      reset();
      start();
    } else {
      setWebrtcStatus({ color: 'var(--red50)', text: "WebRTC service is disconnected, please try again" });
    }
  };

  const handleHangUpClick = () => {
    if (activeCall) {
      activeCall.terminate();
      setAllowHangup(false);
      pause();
    }
  };

  return (
    <div className="dialpad-container">
      <h1>In-App Calling (Global)</h1>
      <h2>(CLICK TO CALL - WEBRTC)</h2>
      <div className='status' style={{color: webrtcStatus.color}}>Status: {webrtcStatus.text}</div>
      <SingleLineInput
        label={'Source Number'}
        placeholder={''}
        value={sourceNumber}
        note={sourceNumberNote}
        changeFunction={handleSourceNumberInput}
      />
      <SingleLineInput
        label={'Destination Number'}
        placeholder={''}
        value={destNumber}
        note={destinationNumberNote}
        changeFunction={handleDestNumberInput}
      />
      <div className='digit-grid'>
        <Digit number={1} letters={' '} onClick={handleDigitClick('1')}/>
        <Digit number={2} letters={'ABC'} onClick={handleDigitClick('2')}/>
        <Digit number={3} letters={'DEF'} onClick={handleDigitClick('3')}/>
        <Digit number={4} letters={'GHI'} onClick={handleDigitClick('4')}/>
        <Digit number={5} letters={'JKL'} onClick={handleDigitClick('5')}/>
        <Digit number={6} letters={'MNO'} onClick={handleDigitClick('6')}/>
        <Digit number={7} letters={'PQRS'} onClick={handleDigitClick('7')}/>
        <Digit number={8} letters={'TUV'} onClick={handleDigitClick('8')}/>
        <Digit number={9} letters={'WXYZ'} onClick={handleDigitClick('9')}/>
        <Digit number={'*'} letters={' '} onClick={handleDigitClick('*')}/>
        <Digit number={0} letters={'+'} onClick={handleDigitClick('0')}/>
        <Digit number={'#'} letters={' '} onClick={handleDigitClick('#')}/>
        <IconButton onClick={handleDialClick} disabled={!destNumberValid}>
            <WifiCallingIcon sx={{ fontSize: "50px", color: destNumberValid ? "var(--green50)" : "var(--grey80)" }}/>
        </IconButton>
        <IconButton onClick={handleBackspaceClick} disabled={destNumber.length === 0}>
            <BackspaceIcon sx={{ color: destNumber.length > 0 ? "var(--red50)" : "var(--grey80)" }}/>
        </IconButton>
        <IconButton onClick={handleHangUpClick} disabled={!allowHangup}>
            <CallEndIcon sx={{ fontSize: "50px", color: allowHangup ? "var(--red50)" : "var(--grey80)" }}/>
        </IconButton>
      </div>
      <div className='call-timer'>{`${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`}</div>
    </div>
  )
}
