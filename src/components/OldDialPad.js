import React, { useCallback, useEffect } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import BackspaceIcon from "./dialpadIcons/BackspaceIcon";
import IconButton from "@mui/material/IconButton";
import {
  TextField,
  Tooltip,
  Box,
  InlineRadioGroup,
  InlineRadio,
  Typography,
} from "@bw/foundry";
import WifiCallingIcon from "@mui/icons-material/WifiCalling";
import CallEndIcon from "@mui/icons-material/CallEnd";
import useModal from "../hooks/useModal";
import "./dialpadIcons/dial-pad.css";
import { useStopwatch } from 'react-timer-hook';


const DialPad = (props) => {
  const {
    onCallClick,
    phoneNumber,
    setPhoneNumber,
    disconnect,
    fromNumber,
    setFromNumber,
    disabled,
    callType,
    setCallType,
    spoofOrType,
    activeCall
  } = props;
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    start,
    pause,
    reset,
  } = useStopwatch({ autoStart: false });
  

  const [isShowing, toggle] = useModal();

  useEffect(() => {
    if(activeCall === null){ pause() }
  }, [activeCall])
  
  const handleDigitClick = useCallback(
    (value) => (event) => {
     
      if(activeCall){
        activeCall.sendDTMF(value)
      }
      else{
        setPhoneNumber((phoneNumber) => phoneNumber.concat(value));
      }

    },
    [activeCall]
  );

  const handleDialClick = () => {
    onCallClick(phoneNumber);
    if(totalSeconds > 0){
      reset()
    }
    start()
  };

  const handleHangUpClick = () => {
    disconnect();
    pause()
  };

  const handleBackspaceClick = () => {
    setPhoneNumber((phoneNumber) => phoneNumber.slice(0, -1));
  };

  const handleInput = (e) => {
    setPhoneNumber(e.target.value.replace(/\D/g, ""));
  };

  const handleFromNumberInput = (e) => {
    setFromNumber(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="dial-pad" data-testid="dial-pad">
      <div className="digits">
        <div className="digit" onClick={handleDigitClick("1")}>
          1<div className="subset"></div>
        </div>
        <div className="digit" onClick={handleDigitClick("2")}>
          2<div className="subset">ABC</div>
        </div>
        <div className="digit" onClick={handleDigitClick("3")}>
          3<div className="subset">DEF</div>
        </div>
        <div className="digit" onClick={handleDigitClick("4")}>
          4<div className="subset">GHI</div>
        </div>
        <div className="digit" onClick={handleDigitClick("5")}>
          5<div className="subset">JKL</div>
        </div>
        <div className="digit" onClick={handleDigitClick("6")}>
          6<div className="subset">MNO</div>
        </div>
        <div className="digit" onClick={handleDigitClick("7")}>
          7<div className="subset">PQRS</div>
        </div>
        <div className="digit" onClick={handleDigitClick("8")}>
          8<div className="subset">TUV</div>
        </div>
        <div className="digit" onClick={handleDigitClick("9")}>
          9<div className="subset">WXYZ</div>
        </div>
        <div className="digit" onClick={handleDigitClick("*")}>
          *
        </div>
        <div className="digit" onClick={handleDigitClick("0")}>
          0<div className="subset">+</div>
        </div>
        <div className="digit" onClick={handleDigitClick("#")}>
          #
        </div>
      </div>
      <div className="controls">
        <div className="call">
          <IconButton
            size="large"
            onClick={handleDialClick}
            disabled={!disabled}
          >
            <WifiCallingIcon
              sx={{ fontSize: "50px", color: disabled ? "green" : "" }}
            />
          </IconButton>
        </div>
        <div className="backspace">
          <IconButton onClick={handleBackspaceClick}>
            <BackspaceIcon />
          </IconButton>
        </div>
        <div className="end">
          <IconButton
            size="large"
            onClick={handleHangUpClick}
            disabled={disabled}
          >
            <CallEndIcon
              sx={{ fontSize: "50px", color: !disabled ? "red" : "" }}
            />
          </IconButton>
        </div>
      </div>
      <div >
        <Typography variant="h3">{`${hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`}</Typography>
      </div>
    </div>
  );
};

export default DialPad;
