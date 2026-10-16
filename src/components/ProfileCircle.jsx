import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { user } from '../data.js'
import { getPhoto, subscribePhoto } from '../profilePhoto.js'
import { currentUser } from '../lib/auth.js'
import { LIVE } from '../lib/dataSource.js'

const initialsOf = (n) => (n || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

// Round profile avatar, top-right in the app. Shows the uploaded photo when
// present, otherwise the signed-in referee's initials.
export default function ProfileCircle({ size = 36 }) {
  const nav = useNavigate()
  const [photo, setPhotoState] = useState(getPhoto())
  useEffect(() => subscribePhoto(setPhotoState), [])
  const name = (LIVE ? (currentUser() && currentUser().name) : null) || user.name
  return (
    <button
      onClick={() => nav('/profile')}
      aria-label="Profile"
      className="rounded-full overflow-hidden bg-brand text-white font-extrabold flex items-center justify-center ring-2 ring-brand-light active:scale-95 transition flex-none"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {photo
        ? <img src={photo} alt="" className="w-full h-full object-cover" />
        : <span>{initialsOf(name)}</span>}
    </button>
  )
}
