import React from 'react';
import '../css/Digit.css';

export default function Digit({number, letters, onClick}) {
  return (
    <div className='digit' onClick={onClick}>
      <div className='number'>{number}</div>
      <div className='letters'>{letters}</div>
    </div>
  )
}
