import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  LinearProgress 
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../Auth/AuthContext';
import { canisterId, createActor } from '../../../declarations/vidchain_backend';

const vidChainActor = createActor(canisterId);

// Shared style for input fields: lighter blue text and visible outlined border.
const textFieldStyle = {
  '& .MuiInputBase-input': { color: 'lightblue' },
  '& .MuiInputLabel-root': { color: 'lightblue' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'lightblue' }
  }
};

const UploadPage = () => {
  const { principal } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'LongForm',
    channel: '',
    duration: 0
  });
  const [uploadState, setUploadState] = useState('idle');
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov'],
      'image/*': ['.jpg', '.png']
    },
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      ));
    }
  });

  // Helper: Reads a file and returns an ArrayBuffer.
  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  // Helper: Converts an ArrayBuffer to a hex string.
  const bufferToHex = (buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadState('uploading');

    // Get the video (media) and thumbnail files.
    const mediaFile = files.find(f => f.type.startsWith('video/'));
    const thumbnailFile = files.find(f => f.type.startsWith('image/'));
    if (!mediaFile) {
      alert('Please select a video file to upload.');
      setUploading(false);
      return;
    }

    // Convert the category string into the proper variant.
    // Representing a variant with no associated data as an object with null.
    const categoryVariant =
      uploadData.category === 'LongForm'
        ? { "LongForm": null }
        : uploadData.category === 'Short'
        ? { "Short": null }
        : uploadData.category === 'Music'
        ? { "Music": null }
        : uploadData.category === 'Gaming'
        ? { "Gaming": null }
        : { "Other": null };

    try {
      // Read the media file.
      const mediaArrayBuffer = await readFile(mediaFile);
      if (!mediaArrayBuffer) {
        throw new Error("Failed to read media file");
      }
      const mediaUint8 = new Uint8Array(mediaArrayBuffer);

      // Compute the SHA-256 hash.
      const hashBuffer = await crypto.subtle.digest('SHA-256', mediaArrayBuffer);
      const contentHashHex = bufferToHex(hashBuffer);
      const contentHashUint8 = new TextEncoder().encode(contentHashHex);

      // Process the thumbnail file: if provided, read it; otherwise, use an empty Uint8Array.
      let thumbnailUint8 = new Uint8Array(0);
      if (thumbnailFile) {
        const thumbnailArrayBuffer = await readFile(thumbnailFile);
        thumbnailUint8 = thumbnailArrayBuffer
          ? new Uint8Array(thumbnailArrayBuffer)
          : new Uint8Array(0);
      }

      // Debug logs: log the lengths of our Uint8Arrays.
      console.log("Media length:", mediaUint8.length);
      console.log("Thumbnail length:", thumbnailUint8.length);
      console.log("Content hash length:", contentHashUint8.length);

      // Call the canister function.
      const result = await vidChainActor.uploadVideo(
        uploadData.title,
        uploadData.description,
        categoryVariant,
        uploadData.channel,
        mediaUint8,
        mediaFile.size < 50 * 1024 * 1024, // isShort flag.
        mediaFile.type,
        uploadData.duration,
        thumbnailUint8,
        contentHashUint8
      );

      console.log("Upload result:", result);
      alert("Upload successful!");
      setUploadState('completed');
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState('error');
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 4, color: 'white' }}>
      <Typography variant="h3">Upload Content</Typography>
      
      <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {/* Upload Zone */}
        <div {...getRootProps()} style={dropzoneStyle}>
          <input {...getInputProps()} />
          <Typography>Drag & drop files here</Typography>
          <Typography>or click to select</Typography>
          {files.map(file => (
            <div key={file.name}>{file.name}</div>
          ))}
        </div>

        {/* Upload Form */}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            variant="outlined"
            label="Title"
            value={uploadData.title}
            onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
            sx={textFieldStyle}
          />
          <TextField
            variant="outlined"
            label="Description"
            multiline
            rows={4}
            value={uploadData.description}
            onChange={e => setUploadData({ ...uploadData, description: e.target.value })}
            sx={textFieldStyle}
          />
          <TextField
            variant="outlined"
            label="Channel"
            value={uploadData.channel}
            onChange={e => setUploadData({ ...uploadData, channel: e.target.value })}
            sx={textFieldStyle}
          />
          <TextField
            variant="outlined"
            label="Duration (seconds)"
            type="number"
            value={uploadData.duration}
            onChange={e => setUploadData({ ...uploadData, duration: Number(e.target.value) })}
            sx={textFieldStyle}
          />
          <FormControl variant="outlined" sx={textFieldStyle}>
            <InputLabel>Category</InputLabel>
            <Select
              value={uploadData.category}
              onChange={e => setUploadData({ ...uploadData, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="LongForm">Long Form Video</MenuItem>
              <MenuItem value="Short">Short</MenuItem>
              <MenuItem value="Music">Music</MenuItem>
              <MenuItem value="Gaming">Gaming</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? <CircularProgress size={24} /> : 'Publish'}
          </Button>

          {uploadState === 'uploading' && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="indeterminate" sx={{ height: 10 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>Uploading...</Typography>
            </Box>
          )}
          
          {uploadState === 'completed' && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              Upload completed successfully!
            </Typography>
          )}
          {uploadState === 'error' && (
            <Typography color="error.main" sx={{ mt: 2 }}>
              Upload failed. Please try again.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const dropzoneStyle = {
  border: '2px dashed #666',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

export default UploadPage;
