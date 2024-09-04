import { useState, useEffect } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import { Sidebar ,Videos} from './'
import { fetchApi }  from './utils/fetchApi'

function Feed() {

const [selectedCategory, setselectedCategory] = useState('New')

  useEffect (() => {
    // eslint-disable-next-line no-template-curly-in-string
    fetchApi('search?part=snippet${selectedCategory}');
  }, [selectedCategory]);

  return (
    <Stack sx={{ flexDirection : { sx:"column", md:"row" }}}
    >
      <Box sx={{height:{sx: 'auto', md:'92vh'}, borderRight: '1px solid #052659', px:{ sx:0,md: 2 }}} >
        <Sidebar
        selectedCategory={selectedCategory} setselectedCategory = {setselectedCategory}/>

        
        <Typography className='copyright' variant='body2' sx ={{ mt :1.5, color:'#fff' }}>
           Copyright 2024 Vidchain Media
        </Typography>
      </Box>
      <Box p={2} sx= {{overflowY: 'auto', height: '90vh',flex:2 }} >
        <Typography variant='h4' fontWeight='bold' mb={2} sx={{color: 'white'}} >
          New <span style={{color : '#052659 '}} >Videos</span>
        </Typography>
        <Videos videos={[ ]} />
      </Box>
      
    </Stack>
  )
}

export default Feed
