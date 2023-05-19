import React, { useState, useRef, useEffect, useContext } from 'react';

import { MenuContext } from './MenuContext';

export default function Menu({nodeId}) {

  // see https://react-flow.netlify.app/docs/api/react-flow-props/#event-handlers

  // the idea is to keep menu opened only if it matches node id

  const { openMenuId, setOpenMenuId } = useContext(MenuContext);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();

    if(showMenu){
      setShowMenu(false);
    } else{
      setShowMenu(true);      
      setOpenMenuId(nodeId)
    }
    
  };


  useEffect(() => {

    const handleClickOutside = (event) => {        
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className='nodeMenu' ref={menuRef} onClick={toggleMenu}>
        <svg className='menuIcon' viewBox="0 0 20 20">
            <path d="M10.001 7.8a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 10 7.8zm-7 0a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 3 7.8zm14 0a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 17 7.8z" />
        </svg>   

        {showMenu && openMenuId === nodeId && (
            <div className="dropdown">
                {/* <div className="item">{nodeId}</div>    */}
                {/* <div className="item">{openMenuId}</div>   */}
                <div className="item">Menu Item 1</div>     
                <div className="item">Menu Item 2</div>    
            </div>
        )}
    </div>
  );
}
