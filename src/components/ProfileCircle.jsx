import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { user } from '../data.js'
import { getPhoto, subscribePhoto } from '../profilePhoto.js'

// Round profile avatar, top-right in the app. Shows the uploaded photo when
// present, otherwise the user's initials. Tapping it opens the profile.
export default function ProfileCircle({ size = 36 }) {
  const nav = useNavigate()
  const [photo, setPhotoState] = useState(getPhoto())
  useEffect(() => subscribePhoto(setPhotoState), [])
  return (
    <button
      onClick={() => nav('/profile')}
      aria-label="Profile"
      className="rounded-full overflow-hidden bg-brand text-white font-extrabold flex items-center justify-center ring-2 ring-brand-light active:scale-95 transition flex-none"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {photo
        ? <img src={photo} alt="" className="w-full h-full object-cover" />
        : <span>{user.initials}</span>}
    </button>
  )
}
