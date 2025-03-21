import React, { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { fetchFromBlockchain } from "../utils/fetchFromBlockchain";
import { Videos, Sidebar } from "./";

const Feed = () => {
  const [selectedCategory, setSelectedCategory] = useState("New");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetchFromBlockchain("searchVideos", selectedCategory)
      .then((data) => {
        setVideos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <Stack sx={{ flexDirection: { sx: "column", md: "row" } }}>
      {/* Sidebar */}
      <Box sx={{ height: { sx: "auto", md: "92vh" }, borderRight: "1px solid #3d3d3d", px: { sx: 0, md: 2 } }}>
        <Sidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <Typography className="copyright" variant="body2" sx={{ mt: 1.5, color: "#fff" }}>
          Copyright © 2025 Zaid Mohammed
        </Typography>
      </Box>

      {/* Main Content */}
      <Box p={2} sx={{ overflowY: "auto", height: "90vh", flex: 2 }}>
        <Typography variant="h4" fontWeight="bold" mb={2} sx={{ color: "white" }}>
          {selectedCategory} <span style={{ color: "#01295F" }}>videos</span>
        </Typography>

        {loading ? (
          <Typography variant="h6" color="gray">Loading...</Typography>
        ) : (
          <Videos videos={videos} />
        )}
      </Box>
    </Stack>
  );
};

export default Feed;
