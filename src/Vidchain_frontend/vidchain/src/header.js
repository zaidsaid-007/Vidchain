import React from "react";
import './header.css'
import SearchIcon from '@mui/icons-material/Search'
function Header() {
    return(
        <div className="header">
            <img className="logo"
                src='vc1.jpg'alt='Vidchain logo'/>

                {/*Search container*/}
            <div className="header_search">
                <input className="Header_search input"
                src='vc1.jpg'alt='Vidchain logo'  
                    type="text" placeholder="Search"/>
                <SearchIcon className="header_searchIcon"/>   
            </div>
            <div className="header_nav"></div>

        </div>
    )

    }
   