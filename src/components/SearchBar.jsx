import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, IconButton } from '@mui/material'
import { Search } from '@mui/icons-material'
import React from 'react'

const SearchBar = () => {
  return (
    <Paper
        component="form"
        onSubmit={() => {}}
        sx={{
            borderRadius:20,
            border: '1px solid #C1E8FF',
            pl:2,
            boxShadow: 'none',
            mr:{ sm: 5}
         }}
    >
        <input
            className='Search-bar'
            placeholder='Search...'
            value=""
            onChange={() => {}}
            style={{ border: 'none', outline: 'none' }}
        />
        <IconButton type="submit"
        sx={{
            p:'1px', color :'#052659'
        }}
        >
            <Search/>
        </IconButton>
        
    </Paper>
  )
}

export default SearchBar
