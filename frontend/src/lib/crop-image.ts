const MAX_SIDE = 1024
const SAMPLE_SIDE = 64
const JPEG_QUALITY = 0.92
const PADDING_RATIO = 0.08
const FALLBACK_BACKGROUND = "#ffffff"

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Cannot read image"))
    }
    image.src = url
  })
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob != null ? resolve(blob) : reject(new Error("Cannot encode image"))),
      type,
      JPEG_QUALITY
    )
  })
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (context == null) {
    throw new Error("Canvas is not available")
  }
  return context
}

function sampleImage(image: HTMLImageElement): ImageData {
  const scale = SAMPLE_SIDE / Math.max(image.naturalWidth, image.naturalHeight)
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = getContext(createCanvas(width, height))
  context.drawImage(image, 0, 0, width, height)
  return context.getImageData(0, 0, width, height)
}

function hasTransparency(sample: ImageData): boolean {
  for (let index = 3; index < sample.data.length; index += 4) {
    if (sample.data[index] < 250) {
      return true
    }
  }
  return false
}

function edgeColor(sample: ImageData): string {
  const { width, height, data } = sample
  const strip = Math.max(1, Math.round(Math.min(width, height) * 0.08))
  const totals = [0, 0, 0]
  let count = 0

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isEdge =
        x < strip || x >= width - strip || y < strip || y >= height - strip
      if (!isEdge) {
        continue
      }
      const offset = (y * width + x) * 4
      totals[0] += data[offset]
      totals[1] += data[offset + 1]
      totals[2] += data[offset + 2]
      count += 1
    }
  }

  if (count === 0) {
    return FALLBACK_BACKGROUND
  }
  const [red, green, blue] = totals.map((total) => Math.round(total / count))
  return `rgb(${red}, ${green}, ${blue})`
}

async function cropToSquare(file: File): Promise<File> {
  const image = await loadImage(file)
  const innerRatio = 1 - 2 * PADDING_RATIO
  const longest = Math.max(image.naturalWidth, image.naturalHeight)
  const inner = Math.min(longest, MAX_SIDE * innerRatio)
  const scale = inner / longest
  const width = Math.round(image.naturalWidth * scale)
  const height = Math.round(image.naturalHeight * scale)
  const side = Math.max(Math.round(inner / innerRatio), width, height)

  const isPng = file.type === "image/png"
  const sample = sampleImage(image)
  const keepTransparent = isPng && hasTransparency(sample)

  const canvas = createCanvas(side, side)
  const context = getContext(canvas)
  context.imageSmoothingQuality = "high"

  if (!keepTransparent) {
    context.fillStyle = edgeColor(sample)
    context.fillRect(0, 0, side, side)
  }
  context.drawImage(
    image,
    Math.round((side - width) / 2),
    Math.round((side - height) / 2),
    width,
    height
  )

  const type = isPng ? "image/png" : "image/jpeg"
  const blob = await toBlob(canvas, type)
  return new File([blob], file.name, { type })
}

export { cropToSquare }
