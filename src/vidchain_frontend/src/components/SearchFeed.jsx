import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { Videos } from "./";
import { canisterId, createActor } from "../../../declarations/vidchain_backend";

const vidChainActor = createActor(canisterId);

const SearchFeed = () => {
  const [videos, setVideos] = useState(null);
  const { searchTerm } = useParams();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Call the blockchain canister's searchVideos method.
        // Here we pass the searchTerm and null for category filter.
        const results = await vidChainActor.searchVideos(searchTerm, null);
        setVideos(results);
      } catch (error) {
        console.error("Error fetching videos from blockchain:", error);
      }
    };

    if (searchTerm) {
      fetchVideos();
    }
  }, [searchTerm]);

  return (
    <Box p={2} minHeight="95vh">
      <Typography
        variant="h4"
        fontWeight={900}
        color="white"
        mb={3}
        ml={{ sm: "100px" }}
      >
        Search Results for <span style={{ color: "#01295F" }}>{searchTerm}</span> videos
      </Typography>
      <Box display="flex">
        <Box sx={{ mr: { sm: "100px" } }} />
        <Videos videos={videos} />
      </Box>
    </Box>
  );
};

export default SearchFeed;

