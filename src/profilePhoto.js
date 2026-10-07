// Tiny reactive store for the referee's profile photo (prototype).
// Persists to localStorage and notifies subscribers so the avatar updates
// everywhere (profile screen + top-right circle) the moment a photo is set.
let photo = ''
try { photo = localStorage.getItem('ra_photo') || '' } catch { /* ignore */ }
const subs = new Set()

export function getPhoto() { return photo }
export function setPhoto(dataUrl) {
  photo = dataUrl || ''
  try { localStorage.setItem('ra_photo', photo) } catch { /* ignore */ }
  subs.forEach((fn) => fn(photo))
}
export function subscribePhoto(fn) { subs.add(fn); return () => subs.delete(fn) }

// Read a File into a data URL (for the mock upload).
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
