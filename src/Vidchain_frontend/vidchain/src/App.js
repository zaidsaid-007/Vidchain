import React from 'react';
import './App.css';
import {BrowserRouter as Router ,Routes , Route ,Link ,Outlet} from 'react-router-dom';
import Home from './Home';
function App(){
  return 
  <div className="app">
    <Router>
      <Routes>
        <Route path='/' element={<Home />}>

        </Route>

      </Routes>
    </Router>



  </div>

}


export default App;
