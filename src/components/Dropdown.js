import React, { useState } from 'react';
import PolygonIcon from '../assets/images/Polygon.svg';
import PolygonIconUp from '../assets/images/Polygon_up.svg';

const useOutsideClick = (callback) => {
  const ref = React.useRef();

  React.useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, callback]);

  return ref;
};

export default function Dropdown({nfts, setSelectedNft}) {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(undefined);
  const toggling = () => setIsOpen(!isOpen);
  const onOptionClicked = (value) => () => {
    setSelectedOption(value);
    setIsOpen(false);
    setSelectedNft(value);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const ref = useOutsideClick(handleClickOutside);

  return (
    <div className='box-container' ref={ref}>
      <div
        className={isOpen ? 'select_token_click select_token' : 'select_token'}
        onClick={toggling}
      >
        {!selectedOption && <span >{'Select your existing collection'}</span>}
        {selectedOption && selectedOption.name && <span >{selectedOption.name+" | "+selectedOption.symbol+ " | "+selectedOption.token_id}</span>}
        <img src={isOpen ? PolygonIconUp : PolygonIcon} alt="icon" />
      </div>
      {isOpen && (
        <div className="dropdown_list_container">
          <ul className="dropdown_list">
            {nfts.map((option, key) => (
              <li key={key} onClick={onOptionClicked(option)}>
                {option.name+" | "+option.symbol+" | "+option.token_id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}