
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { NewDecision } from './pages/NewDecision';
import { WhatIf } from './pages/WhatIf';
import { History } from './pages/History';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-decision" element={<NewDecision />} />
        <Route path="/what-if" element={<WhatIf />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </>
  );
}

export default App;