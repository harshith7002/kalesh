// Renders the off-screen 1200x675 card node to a PNG and downloads it.
// html2canvas is loaded on first use so it stays out of the main bundle.
export async function downloadCard(node, filename) {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(node, {
    backgroundColor: '#000000',
    width: 1200,
    height: 675,
    scale: 1,
    useCORS: true,
    logging: false,
  })
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not render the card image')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
