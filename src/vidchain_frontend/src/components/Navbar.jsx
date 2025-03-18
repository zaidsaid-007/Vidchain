import { useState } from 'react';
import { Stack, IconButton, Menu, MenuItem, Avatar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from '../Auth/AuthContext'; // Create this context
import { logo } from "../utils/constants";
import { SearchBar } from "./";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, login, logout, principal } = useAuth();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack direction="row" alignItems="center" p={2} sx={{ 
      position: "sticky", 
      background: '#000', 
      top: 0, 
      justifyContent: "space-between",
      zIndex: 1000
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="logo" height={45} />
      </Link>
      <SearchBar />
      
      <div>
        {isAuthenticated ? (
          <>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {principal ? principal.slice(0, 2) : 'US'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/profile">
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/channel">
                <Typography variant="body2">My Channel</Typography>
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/upload">
                <Typography variant="body2">Upload Video</Typography>
              </MenuItem>
              <MenuItem onClick={logout}>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <IconButton onClick={login} color="inherit">
            <Avatar sx={{ bgcolor: 'grey.700' }} />
          </IconButton>
        )}
      </div>
    </Stack>
  );
};

export default Navbar;
