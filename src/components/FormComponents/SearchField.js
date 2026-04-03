import React from "react";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";

const SearchField = ({
  value,
  onChange,
  placeholder = "Search...",
  closeFunction,
  className = "",
}) => {
  return (
    <div className={`search-field ${className}`}>
      <div className="search-input-container">
        {/* Left icon */}
        <AiOutlineSearch className="search-icon" size={16} />

        {/* Input */}
        <input
          className="search-input"
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

        {value && (
          <AiOutlineClose
            className="clear-icon"
            size={16}
            onClick={closeFunction}
          />
        )}
      </div>
    </div>
  );
};

export default SearchField;
