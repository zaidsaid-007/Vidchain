import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from '@mui/material';
import { AuthProvider } from './Auth/AuthContext';
import UploadPage from './Pages/UploadPage';
import ProfilePage from './Pages/Profilepage';
import ChannelPage from './Pages/ChannelPage';

import { 
  ChannelDetail, 
  VideoDetail, 
  SearchFeed, 
  Navbar, 
  Feed 
} from './components';

// Import new pages


const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Box sx={{ backgroundColor: '#000' }}>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<Feed />} />
          <Route path='/video/:id' element={<VideoDetail />} />
          <Route path="/channel/:channelId" element={<ChannelPage />} />
          <Route path='/search/:searchTerm' element={<SearchFeed />} />
          <Route path='/upload' element={<UploadPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/channel' element={<ChannelPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  </AuthProvider>
);

export default App;