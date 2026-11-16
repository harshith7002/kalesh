import { avatarColor, initialOf } from '../lib/utils'

export default function Avatar({ handle, size = 40 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: avatarColor(handle), fontSize: size * 0.42 }}
      aria-hidden
    >
      {initialOf(handle)}
    </div>
  )
}
