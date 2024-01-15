import { useState, useEffect } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import React from 'react'


function Feed() {
  return (
    <Stack sx={{ flexDirection : { sx:"column", md:"row" }}}
    >
      <Box sx={{height:{sx: 'auto', md:'92vh'}, borderRight: '1px solid #052659', px:{ sx:0,md: 2 }}} >
        Sidebar
        <Typography className='coprright' variant='body2' sx ={{ mt :1.5, color:'#fff' }}>
           Copyright 2024 Vichain Media
        </Typography>
      </Box>
      
    </Stack>
  )
}

export default Feed
