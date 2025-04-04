import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Placeholder Components
const HomePage = () => (
  <div>
    <h1>Home Page</h1>
    <nav>
      <Link to="/login">Login</Link>
    </nav>
  </div>
);

const LoginPage = () => (
  <div>
    <h1>Login Page (Placeholder)</h1>
    <nav>
      <Link to="/">Home</Link>
    </nav>
  </div>
);

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      {/* Basic Navigation (can be moved to a Layout component later) */}
      {/* <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
      </nav> */}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Add other routes here */}
      </Routes>
    </div>
  )
}

export default App
