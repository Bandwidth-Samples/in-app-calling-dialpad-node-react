import React, { useCallback, useEffect, useState } from 'react';
import '../css/DialPad.css';
import Digit from './Digit';
import StartCallIcon from '../img/start-call-icon.svg';
import EndCallIcon from '../img/end-call-icon.svg';
import BackspaceIcon from '../img/backspace-icon.svg';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import { BandwidthUA } from "@bandwidth/bw-webrtc-sdk";
import { useStopwatch } from 'react-timer-hook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormControl, InputLabel } from '@mui/material';
import countries from '../utils/countries';
import { countryCodeFormStyles, countryCodeSelectStyles, phoneNumberInputStyles } from '../utils/styles';

export default function DialPad() {
  const authToken = process.env.REACT_APP_IDENTITY_TOKEN;
  const sourceNumber = process.env.BW_NUMBER;
  const defaultNumberNote = 'Select a country or input a phone number';
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
  const [status, setStatus] = useState('Add Number');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumberNote, setPhoneNumberNote] = useState(defaultNumberNote);
  const [destNumberValid, setDestNumberValid] = useState(false);
  const [allowHangup, setAllowHangup] = useState(false);
  const [phone, setPhone] = useState(new BandwidthUA());
  const [activeCall, setActiveCall] = useState(null);

  const numberInputStyle = {
    display: `${allowHangup ? 'none' : 'flex'}`
  }

  const callingNumberStyle = {
    display: `${allowHangup ? 'flex' : 'none'}`
  }

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
    setDestNumber(destNumber.replace(/\D/g, ""));
  }, [destNumber]);

  useEffect(() => {
    if (activeCall === null) { pause() }
  }, [activeCall]);

  useEffect(() => {
    if (destNumber.length > 0 || countryCode.length > 0) {
      setPhoneNumberNote('Acceptable +1 formats include E.164, 11-digit, or 10-digit. For example: +18005551234, (919) 555-1234, 1.800.555.1234');
    } else {
      setPhoneNumberNote(defaultNumberNote);
    }
  }, [destNumber, countryCode]);
  
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

  const handleCountryCode = (e) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneNumber = (e) => {
    setDestNumber(e.target.value.replace(/\D/g, ""));
  };

  const handleBackspaceClick = () => {
    setDestNumber((destNumber) => destNumber.slice(0, -1));
  };

  const handleDialClick = () => {
    if (phone.isInitialized()) {
      setStatus('Calling...');
      setActiveCall(phone.call(`${countries[countryCode].code}${destNumber}`));
      setAllowHangup(true);
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

  return (
    <div className="dialpad-container">
      <h2>{status}</h2>
      <div className='number-input' style={numberInputStyle}>
        <FormControl sx={countryCodeFormStyles}>
          <InputLabel id="country-code-label">Country</InputLabel>
          <Select
            value={countryCode}
            onChange={handleCountryCode}
            renderValue={(p) => countries[p].value}
            variant='outlined'
            label='Country'
            sx={countryCodeSelectStyles}
            IconComponent = {ExpandMoreIcon}
          >
            {Object.keys(countries).map((country) => (
              <MenuItem value={country}>{countries[country].name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          onChange={handlePhoneNumber}
          value={destNumber}
          sx={phoneNumberInputStyles}
          label=""
          placeholder="Phone Number"
        />
      </div>
      <div className='number-note' style={numberInputStyle}>{phoneNumberNote}</div>
      {/* <div className='calling-number' style={callingNumberStyle}>{countries[countryCode].code ? countries[countryCode].code : ''} {destNumber}</div> */}
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
      </div>
      <div className='call-controls'>
        <div className='call-start-end'>
          {!allowHangup ? 
          <button className='start-call-button' onClick={handleDialClick} disabled={!destNumberValid}>
              <img src={StartCallIcon} className='call-button-img'/>
          </button>
          :
          <button className='end-call-button' onClick={handleHangUpClick} disabled={!allowHangup}>
            <img src={EndCallIcon} className='call-button-img'/>
          </button>}
        </div>
        {destNumber.length > 0 && <button className='backspace-button' onClick={handleBackspaceClick} disabled={destNumber.length === 0}>
          <img src={BackspaceIcon} className='backspace-button-img'/>
        </button>}
      </div>
      {/* <div className='call-timer'>{`${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`}</div> */}
    </div>
  )
}
