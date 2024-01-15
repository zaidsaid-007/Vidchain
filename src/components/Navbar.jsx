import React from 'react'
import {Stack} from '@mui/material'
import {Link} from 'react-router-dom'
import SearchBar from './SearchBar'

import { logo } from './utils/constants'
import vidc from './utils/vidc2.png'

const Navbar = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      p={2}
      sx={{ position: 'sticky', background: '#021024', top: 0, justifyContent: 'space-between' }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src= {vidc} alt="Vidchain logo" height={45} />
      </Link>
      <SearchBar />
    </Stack>
  );
};

export default Navbar;
