import React from 'react'
import { Stack } from '@mui/material'
import { categories } from './utils/constants'




const Sidebar = ({selectedCategory, setSelectedCategory}) => {
  return (
    <Stack
        direction = 'row'
        sx= {{
            overflowY:'auto',
            height: {sx: 'auto', md: '95%'},
            flexDirection:{ md: 'column'},
            

        }}
    >
        {categories.map((Category)=> (
            <button
                className='category-btn'
                onClick={() => setSelectedCategory(Category.name)}
                style={{
                    backgroundColor : Category.name === selectedCategory && '#052659' ,
                    color : 'white'
                }}
            >
                <span style={{color : Category.name === selectedCategory ? 'white' : '#052659', marginRight: '15px' }} >{Category.icon}</span>
                <span style={{opacity: Category.name === selectedCategory ? '1':'0.8' }} >{Category.name}</span>
            </button>
        ))}
      
    </Stack>
  )
}

export default Sidebar
