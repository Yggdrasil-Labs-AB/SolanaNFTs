import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Homepage from './components/pages/Homepage';
import LandingPage from './components/pages/LandingPage';
import Collection from './components/pages/Collection';
import Marketplace from './components/Marketplace/Marketplace';
import CreatorHubDocs from './components/pages/CreatorHubDocs';
import CharacterSubmission from './components/pages/CharacterSubmission';
import Admin from './components/pages/Admin';
import TokenSync from './components/pages/TokenSync';
import NftHomepage from './components/pages/NftHomepage';
import { useWalletAdmin } from './providers/WalletAdminProvider';


function App() {

  const {userRole} = useWalletAdmin();

  const isAdmin = userRole === "admin";

  return (
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<NftHomepage />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/marketplace' element={<Marketplace />}/>
            <Route path='/marketplace/:id/:redirectAddress' element={<Marketplace />} />
            <Route path='/docs' element={<CreatorHubDocs />} />
            <Route path='/character-submit' element={<CharacterSubmission />} />
            <Route path='/token-sync' element={<TokenSync />} />
            <Route path='/token-sync/:id' element={<TokenSync />} />
            {isAdmin && <Route path="/game" element={<Homepage />} />}
            {isAdmin && <Route path='/admin' element={<Admin />} />}
          </Routes>
        </Router>
  )
}

export default App
