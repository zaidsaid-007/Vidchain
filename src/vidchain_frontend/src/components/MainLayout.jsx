import React from "react";
import { Grid } from "@mui/material";
import { Sidebar } from "../components";

const MainLayout = ({ children }) => {
  return (
    <Grid container>
      {/* Sidebar always visible */}
      <Grid item xs={12} md={3} sx={{ borderRight: { md: "1px solid #444" } }}>
        <Sidebar />
      </Grid>
      <Grid item xs={12} md={9}>
        {children}
      </Grid>
    </Grid>
  );
};

export default MainLayout;
