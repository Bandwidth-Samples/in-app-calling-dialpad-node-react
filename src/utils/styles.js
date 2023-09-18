const countryCodeFormStyles = {
  '.MuiFormLabel-root': { marginTop: '-5px', fontFamily: 'Overpass', color: 'var(--grey55) !important' },
  '.MuiInputLabel-shrink': { marginTop: '0' },
  '.MuiInputBase-formControl': { border: 'none', fontFamily: 'Overpass' }
};

const countryCodeSelectStyles = {
  width: '120px',
  height: '44px',
  boxShadow: 'none',
  '.MuiOutlinedInput-notchedOutline': { border: '2px solid var(--grey20) !important', boxSizing: 'border-box' }
};

const phoneNumberInputStyles = {
  width: 'calc(100% - 120px)',
  '.MuiOutlinedInput-root': { height: '45px', border: '2px solid var(--grey20)', marginTop: '-1px' },
  '.MuiInputBase-input': { lineHeight: '12px', fontFamily: 'Overpass' },
  '& fieldset': { border: 'none' },
  '.MuiInputBase-input::placeholder': { color: 'var(--grey55)', opacity: '1' }
};

export { countryCodeFormStyles, countryCodeSelectStyles, phoneNumberInputStyles };
