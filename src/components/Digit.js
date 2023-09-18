import React from 'react';
import '../css/Digit.css';

export default function Digit({number, letters, onClick}) {
  return (
    <div className='digit' onClick={onClick}>
      <div className='digit-number'>{number}</div>
      <div className='digit-letters'>{letters}</div>
    </div>
  )
}
