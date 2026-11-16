import { avatarColor, initialOf } from '../lib/utils'

// Colour comes from the author id when there is one, so two people using the
// same handle still get different avatars.
export default function Avatar({ handle, authorId, size = 40 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: avatarColor(authorId || handle), fontSize: size * 0.42 }}
      aria-hidden
    >
      {initialOf(handle)}
    </div>
  )
}
