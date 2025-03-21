import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Select, MenuItem, Button } from "@mui/material";
import { useAuth } from "../Auth/AuthContext";
import { canisterId, createActor } from "../../../declarations/vidchain_backend";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const vidChainActor = createActor(canisterId);

// Light blue style for form fields.
const textFieldStyle = {
  "& .MuiInputBase-input": { color: "lightblue" },
  "& .MuiInputLabel-root": { color: "lightblue" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "lightblue" }
  }
};

const ProfilePage = () => {
  const { principal } = useAuth();
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    gender: '', 
    birthday: '', 
    totalWatchTime: 0 
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Load profile from blockchain and convert optional values.
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const result = await vidChainActor.getProfile();
        if (result.ok) {
          // Transform the returned opt values:
          // Assuming result.ok.email, birthday, and gender are represented as arrays:
          const loadedProfile = {
            name: result.ok.name,
            email: result.ok.email.length > 0 ? result.ok.email[0] : "",
            gender: result.ok.gender.length > 0 ? result.ok.gender[0] : "",
            birthday: result.ok.birthday.length > 0
              ? new Date(result.ok.birthday[0] * 1000).toISOString().split("T")[0]
              : "",
            totalWatchTime: result.ok.totalViews || 0 // using totalViews as placeholder
          };
          if (isMounted) {
            setProfile(loadedProfile);
            setOriginalProfile(loadedProfile);
            toast.success("Profile loaded successfully!");
          }
        } else {
          console.error("Error in getProfile:", result.err);
          toast.error("Error loading profile: " + result.err);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Error loading profile.");
      }
    };
    if (principal) loadProfile();
    return () => { isMounted = false; };
  }, [principal]);

  // Save updated profile to the blockchain.
  const handleSave = async () => {
    try {
      // For each field, if the user left it empty, fall back to the original value.
      const emailValue = profile.email === "" && originalProfile ? originalProfile.email : profile.email;
      const genderValue = profile.gender === "" && originalProfile ? originalProfile.gender : profile.gender;
      const birthdayStr = profile.birthday === "" && originalProfile ? originalProfile.birthday : profile.birthday;
      
      // Convert birthday string to opt int.
      let birthdayOption = [];
      if (birthdayStr) {
        const d = new Date(birthdayStr);
        if (!isNaN(d)) {
          birthdayOption = [Math.floor(d.getTime() / 1000)];
        }
      }
      // Build options for email and gender.
      const emailOption = emailValue ? [emailValue] : [];
      const genderOption = genderValue ? [genderValue] : [];
      
      await vidChainActor.updateProfile({
        name: profile.name,
        email: emailOption,
        gender: genderOption,
        birthday: birthdayOption
      });
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
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
          sx={{ mb: 2, ...textFieldStyle }}
        />
        
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          sx={{ mb: 2, ...textFieldStyle }}
        />

        <Select
          value={profile.gender}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          fullWidth
          displayEmpty
          sx={{ mb: 2, ...textFieldStyle }}
        >
          <MenuItem value="">Select Gender</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>

        <TextField
          label="Birthday"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={profile.birthday}
          onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
          sx={{ mb: 2, ...textFieldStyle }}
        />

        <Button 
          variant="contained" 
          onClick={editMode ? handleSave : () => setEditMode(true)}
          sx={{ backgroundColor: "lightblue", color: "#000" }}
        >
          {editMode ? "Save Profile" : "Edit Profile"}
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Watch History</Typography>
        <Typography>
          Total Watch Time: {profile.totalWatchTime} minutes
        </Typography>
      </Box>
      {/* Toast container for notifications */}
      <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </Box>
  );
};

export default ProfilePage;
