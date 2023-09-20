import React, { useCallback, useEffect, useState } from 'react';
import '../css/DialPad.css';
import StatusBar from './StatusBar';
import DigitGrid from './DigitGrid';
import NumberInput from './NumberInput';
import CallControlButton from './CallControlButton';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { BandwidthUA } from "@bandwidth/bw-webrtc-sdk";
import { useStopwatch } from 'react-timer-hook';

export default function DialPad() {
  const authToken = process.env.REACT_APP_IN_APP_CALLING_TOKEN;
  const sourceNumber = process.env.REACT_APP_IN_APP_CALLING_NUMBER;
  const { totalSeconds, seconds, minutes, hours, start, pause, reset } = useStopwatch({ autoStart: false });
  // `${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`

  const [destNumber, setDestNumber] = useState('');
  const [webRtcStatus, setWebRtcStatus] = useState('Idle');
  const [callStatus, setCallStatus] = useState('Add Number');
  const [destNumberValid, setDestNumberValid] = useState(false);
  const [allowHangup, setAllowHangup] = useState(false);
  const [phone, setPhone] = useState(new BandwidthUA());
  const [activeCall, setActiveCall] = useState(null);
  const [dialedNumber, setDialedNumber] = useState('');
  const [allowBackspace, setAllowBackspace] = useState(false);
  const [allowMute, setAllowMute] = useState(false);
  const [allowHold, setAllowHold] = useState(false);
  const [onMute, setOnMute] = useState(false);
  const [onHold, setOnHold] = useState(false);

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
        if (call !== activeCall) {
          console.log("terminated no active call");
          return;
        }
        setAllowHangup(false);
        setActiveCall(null);
        setCallStatus('Add Number');
        setWebRtcStatus('Idle');
        setAllowBackspace(true);
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
    destNumber.length > 7 ? setDestNumberValid(true) : setDestNumberValid(false);
    destNumber.length > 0 ? setAllowBackspace(true) : setAllowBackspace(false);
    setDestNumber(destNumber.replace(/\D/g, ''));
  }, [destNumber]);

  useEffect(() => {
    if (activeCall === null) { pause() }
  }, [activeCall]);

  // const handleDigitClick = useCallback(
  //   (value) => (event) => {
  //     if (activeCall) {
  //       activeCall.sendDTMF(value)
  //     }
  //     else {
  //       setDestNumber((destNumber) => destNumber.concat(value));
  //     }
  //   },
  //   [activeCall]
  // );
  const handleDigitClick = (value) => {
    activeCall ? activeCall.sendDTMF(value) : setDestNumber((destNumber) => destNumber.concat(value));
  }

  const handlePhoneNumber = (e) => {
    setDestNumber(e.target.value.replace(/\D/g, ''));
  };

  const handleBackspaceClick = () => {
    setDestNumber((destNumber) => destNumber.slice(0, -1));
  };

  const handleDialClick = () => {
    if (phone.isInitialized()) {
      setCallStatus('Calling');
      setWebRtcStatus('Ringing');
      setActiveCall(phone.call(`+${destNumber}`));
      setDialedNumber(`+${destNumber}`);
      setAllowHangup(true);
      setAllowBackspace(false);
      reset();
      start();
    }
  };

  const handleHangUpClick = () => {
    if (activeCall) {
      activeCall.terminate();
      setAllowHangup(false);
      pause();
    }
  };

  const handleHoldClick = () => {
    if (activeCall) {
      if (!activeCall.isRemoteHold()) {
        activeCall.hold();
      }
    }
    // setOnHold(!onHold);
  };

  const handleMuteClick = () => {
    if (activeCall) {
      activeCall.isAudioMuted() ? activeCall.muteAudio(false) : activeCall.muteAudio(true);
    }
    // setOnMute(!onMute);
  };

  const statusBarProps = {
    muteClick: handleMuteClick,
    holdClick: handleHoldClick,
    webRtcStatus,
    allowMute,
    allowHold,
    onMute,
    onHold
  };

  const numberInputProps = {
    onChange: handlePhoneNumber,
    value: destNumber
  };

  const endCallButtonProps = {
    type: 'end-call',
    onClick: handleHangUpClick,
    disabled: !allowHangup,
    Icon: CallEndIcon,
    iconColor: 'var(--white)'
  };

  const startCallButtonProps = {
    type: 'start-call',
    onClick: handleDialClick,
    disabled: !destNumberValid,
    Icon: CallIcon,
    iconColor: 'var(--white)'
  };

  const backspaceButtonProps = {
    type: 'backspace',
    onClick: handleBackspaceClick,
    disabled: !allowBackspace,
    Icon: BackspaceIcon,
    iconColor: 'var(--grey15)',
    fontSize: 'medium'
  };

  return (
    <div className='app-container'>
      <StatusBar {...statusBarProps}/>
      <div className="dialpad-container">
        <h2>{callStatus}</h2>
        {!allowHangup ? <NumberInput {...numberInputProps}/> : <div className='dialed-number'>{dialedNumber}</div>}
        <DigitGrid onClick={handleDigitClick}/>
        <div className='call-controls'>
          <div className='call-start-end'>
            {!allowHangup ? <CallControlButton {...startCallButtonProps}/> : <CallControlButton {...endCallButtonProps}/>}
          </div>
          {allowBackspace && <CallControlButton {...backspaceButtonProps}/>}
        </div>
      </div>
    </div>
  );
}
