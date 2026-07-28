import { Routes, Route, Outlet } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame.jsx'
import BottomNav from './components/BottomNav.jsx'
import Hub from './pages/Hub.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Offer from './pages/Offer.jsx'
import PasswordGate from './pages/PasswordGate.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Tournaments from './pages/Tournaments.jsx'
import TournamentDetail from './pages/TournamentDetail.jsx'
import Documents from './pages/Documents.jsx'
import News from './pages/News.jsx'
import Chat from './pages/Chat.jsx'
import Profile from './pages/Profile.jsx'
import ChatOrg from './pages/ChatOrg.jsx'
import GroupChat from './pages/GroupChat.jsx'

function PhoneShell() {
  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  )
}

function TabLayout() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PasswordGate><Hub /></PasswordGate>} />
      <Route path="/client" element={<Hub showOffer={false} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/offer" element={<PasswordGate><Offer /></PasswordGate>} />
      <Route element={<PhoneShell />}>
        <Route path="/login" element={<Login />} />
        <Route element={<TabLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/news" element={<News />} />
          <Route path="/chats" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/tournament/:id/group" element={<GroupChat />} />
        <Route path="/chat" element={<ChatOrg />} />
      </Route>
    </Routes>
  )
}
