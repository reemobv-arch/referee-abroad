import { Routes, Route, Outlet } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame.jsx'
import BottomNav from './components/BottomNav.jsx'
import Hub from './pages/Hub.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Offer from './pages/Offer.jsx'
import Contract from './pages/Contract.jsx'
import PasswordGate from './pages/PasswordGate.jsx'
import Phase1Hub from './pages/Phase1Hub.jsx'
import Phase1SourceOfTruth from './pages/Phase1SourceOfTruth.jsx'
import SprintBoard from './pages/SprintBoard.jsx'
import ProgressLog from './pages/ProgressLog.jsx'
import Handover from './pages/Handover.jsx'
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
import Matches from './pages/Matches.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import Availability from './pages/Availability.jsx'
import NotificationPrefs from './pages/NotificationPrefs.jsx'
import Assistant from './pages/Assistant.jsx'
import Notifications from './pages/Notifications.jsx'

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
      <Route path="/contract" element={<PasswordGate><Contract /></PasswordGate>} />
      <Route path="/phase1" element={<PasswordGate><Phase1Hub /></PasswordGate>} />
      <Route path="/phase1/source-of-truth" element={<PasswordGate><Phase1SourceOfTruth /></PasswordGate>} />
      <Route path="/phase1/sprint-board" element={<PasswordGate><SprintBoard /></PasswordGate>} />
      <Route path="/phase1/progress-log" element={<PasswordGate><ProgressLog /></PasswordGate>} />
      <Route path="/phase1/handover" element={<PasswordGate><Handover /></PasswordGate>} />
      <Route element={<PhoneShell />}>
        <Route path="/login" element={<Login />} />
        <Route element={<TabLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/news" element={<News />} />
          <Route path="/chats" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/tournament/:id/group" element={<GroupChat />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/chat" element={<ChatOrg />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification-settings" element={<NotificationPrefs />} />
        <Route path="/availability" element={<Availability />} />
      </Route>
    </Routes>
  )
}
