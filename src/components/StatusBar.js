import React from 'react';
import '../css/StatusBar.css';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallIcon from '@mui/icons-material/Call';
import PhonePausedIcon from '@mui/icons-material/PhonePaused';

export default function StatusBar({ muteClick, holdClick, webRtcStatus, allowMute, allowHold, onMute, onHold }) {
  const muteText = onMute ? 'Unmute' : 'Mute';
  const holdText = onHold ? 'Unhold' : 'Hold';
  const iconStyle = { fontSize: '16px' };
  const muteIcon = onMute ? <MicIcon sx={iconStyle}/> : <MicOffIcon sx={iconStyle}/>;
  const holdIcon = onHold ? <CallIcon sx={iconStyle}/> : <PhonePausedIcon sx={iconStyle}/>;

  return (
    <div className='status-bar'>
      <div className='webrtc-status'>Status: <span>{webRtcStatus}</span></div>
      <button className='mute-button' disabled={!allowMute} onClick={() => muteClick()}>{muteIcon}{muteText}</button>
      <button className='hold-button' disabled={!allowHold} onClick={() => holdClick()}>{holdIcon}{holdText}</button>
    </div>
  );
}
