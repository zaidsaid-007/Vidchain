import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  Grid, 
  Button 
} from "@mui/material";
import { useParams } from "react-router-dom";
import { BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { canisterId, createActor } from "../../../declarations/vidchain_backend";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../Auth/AuthContext";
import { Principal } from "@dfinity/principal";

const vidChainActor = createActor(canisterId);

const VideoItem = ({ video, onDelete, onUpdate }) => {
  return (
    <Box 
      sx={{ 
        border: "1px solid #444", 
        borderRadius: 1, 
        p: 2, 
        mb: 2,
        backgroundColor: "#111" 
      }}
    >
      <Typography variant="h6">{video.title}</Typography>
      <Typography variant="body2">Views: {video.views}</Typography>
      <Typography variant="body2">Duration: {video.duration} seconds</Typography>
      <Box sx={{ mt: 1 }}>
        <Button 
          variant="contained" 
          color="error" 
          size="small" 
          onClick={() => onDelete(video.id)}
          sx={{ mr: 1 }}
        >
          Delete
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={() => {
            const newTitle = prompt("Enter new title", video.title);
            if (newTitle) onUpdate(video.id, { title: newTitle });
          }}
        >
          Update Title
        </Button>
      </Box>
    </Box>
  );
};

const ChannelPage = () => {
  // Extract the 'id' parameter from the URL; your route is defined as '/channel/:id'
  const { id } = useParams();
  // Get current authenticated user's principal as a fallback
  const { principal: currentPrincipal } = useAuth();
  // Use the URL parameter if available; otherwise, fallback to the current user's principal
  const channelId = id || currentPrincipal;

  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    if (!channelId) {
      setError("Invalid channel id. Please check the URL or ensure you are logged in.");
      setLoading(false);
      return;
    }

    try {
      // Optionally, convert channelId to a Principal if needed:
      // const channelPrincipal = Principal.fromText(channelId);
      const channelPrincipal = channelId; // If your backend accepts a string

      // Fetch analytics data for the given channel.
      const analyticsData = await vidChainActor.getChannelAnalytics(channelPrincipal);
      
      // Retrieve all videos using searchVideos.
      const searchResults = await vidChainActor.searchVideos("", null);
      
      // Filter videos where the uploader matches the channel.
      const channelVideos = searchResults.filter(video => 
        video.uploader === channelPrincipal || video.uploader === channelId
      );
      
      setAnalytics(analyticsData);
      setVideos(channelVideos);
    } catch (err) {
      console.error(err);
      setError("Failed to load channel data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, timeRange, currentPrincipal]);

  // Delete a video.
  const handleDelete = async (videoId) => {
    try {
      const result = await vidChainActor.deleteVideo(videoId);
      if (result.ok !== undefined) {
        alert("Video deleted successfully.");
        loadData();
      } else {
        alert("Delete failed: " + result.err);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the video.");
    }
  };

  // Update video details.
  const handleUpdate = async (videoId, newDetails) => {
    try {
      const result = await vidChainActor.updateVideo(videoId, newDetails);
      if (result.ok !== undefined) {
        alert("Video updated successfully.");
        loadData();
      } else {
        alert("Update failed: " + result.err);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the video.");
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 4, color: "white" }}>
        <Typography variant="h3" gutterBottom>
          Channel Analytics
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {/* Analytics Overview */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5">Performance Summary</Typography>
              <FormControl sx={{ mt: 2, minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>

              {analytics && analytics.popularContent && (
                <BarChart
                  width={400}
                  height={300}
                  data={analytics.popularContent}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              )}
              {analytics && (
                <Box sx={{ mt: 2 }}>
                  <Typography>Total Views: {analytics.totalViews}</Typography>
                  <Typography>Total Videos: {analytics.totalVideos}</Typography>
                  <Typography>
                    Avg. Watch Time: {analytics.avgWatchTime.toFixed(2)} seconds
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Video List with Delete/Update Options */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Uploaded Content
              </Typography>
              {videos.length === 0 ? (
                <Typography>No videos found for this channel.</Typography>
              ) : (
                videos.map((video) => (
                  <VideoItem 
                    key={video.id} 
                    video={video} 
                    onDelete={handleDelete} 
                    onUpdate={handleUpdate} 
                  />
                ))
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
};

export default ChannelPage;
