import { Routes, Route, Outlet } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame.jsx'
import BottomNav from './components/BottomNav.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Tournaments from './pages/Tournaments.jsx'
import TournamentDetail from './pages/TournamentDetail.jsx'
import Documents from './pages/Documents.jsx'
import News from './pages/News.jsx'
import Profile from './pages/Profile.jsx'
import ChatOrg from './pages/ChatOrg.jsx'
import GroupChat from './pages/GroupChat.jsx'

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
    <PhoneFrame>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<TabLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/news" element={<News />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/tournament/:id/group" element={<GroupChat />} />
        <Route path="/chat" element={<ChatOrg />} />
      </Routes>
    </PhoneFrame>
  )
}
