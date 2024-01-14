import React from 'react'
import {Stack} from '@mui/material'
import {link} from 'react-router-dom'
import SearchBar from './SearchBar'

import { logo } from './utils/constants'


const Navbar = () => {

  <Stack 
    direction = "row" 
    alignItems="center" 
    p={2} 
    sx={{position: 'sticky',background:'#000',top:0, justifyContent:'space-between'}}
  >
    <link to ="/" style={{display:'flex',alignItems:'center'}}>
      <img src ={logo} alt ="Vidchain logo" height ={45} />
    </link>
    <SearchBar />
  </Stack>
}

export default Navbar;
