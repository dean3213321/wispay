import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Navbar from './components/Navbar';
import Students from './Students';


function App() {
  return (

    <Router>
    <div className="App">
       <Navbar />
      <Routes>
       <Route  exact path="/" element={<Dashboard />} />
       <Route  exact path="/students" element={<Students />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
