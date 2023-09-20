import React from 'react';
import '../css/CallControlButton.css';

export default function CallControlButton({type, onClick, disabled, Icon, iconColor, fontSize='large'}) {
  return (
    <button className={`${type}-button`} onClick={onClick} disabled={disabled}>
      <Icon sx={{ color: iconColor }} fontSize={fontSize}/>
    </button>
  );
}
