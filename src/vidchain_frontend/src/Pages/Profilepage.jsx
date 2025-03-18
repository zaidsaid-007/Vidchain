import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, Chip, TextField, Select, MenuItem, Button } from "@mui/material";
import { useAuth } from "../Auth/AuthContext";
// import { api } from "../api"; // Make sure your API is imported correctly

const ProfilePage = () => {
  const { principal } = useAuth();
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    gender: '', 
    birthday: '', 
    totalWatchTime: 0 // default value if not provided
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await api.getUserProfile(principal);
        if (isMounted) setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    if (principal) loadProfile();

    return () => { isMounted = false; };
  }, [principal]);

  const handleSave = async () => {
    try {
      await api.updateProfile(profile);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Box sx={{ p: 4, color: "white" }}>
      <Typography variant="h3" gutterBottom>
        Profile Management
      </Typography>
      
      <Box component="form" sx={{ mt: 4, maxWidth: 600 }}>
        <TextField
          label="Name"
          fullWidth
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={profile.email || ""}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Select
          value={profile.gender || ""}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>

        <TextField
          label="Birthday"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={profile.birthday || ""}
          onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Button 
          variant="contained" 
          onClick={editMode ? handleSave : () => setEditMode(true)}
        >
          {editMode ? "Save Profile" : "Edit Profile"}
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Watch History</Typography>
        <Typography>
          Total Watch Time: {profile.totalWatchTime || 0} minutes
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfilePage;
