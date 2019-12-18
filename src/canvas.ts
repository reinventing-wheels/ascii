import { max, clz32 } from 'wheels/esm/math'
import { context2d } from 'wheels/esm/dom'

// most significant bit (but msb(x) is always >=1)
const msb = (n: number) => 1 << max(0, 31 - clz32(n))

export type Source =
  CanvasRenderingContext2D |
  HTMLCanvasElement |
  HTMLImageElement |
  HTMLVideoElement |
  ImageBitmap

export const extract = (src: Source) =>
  src instanceof CanvasRenderingContext2D
    ? src.canvas
    : src

export const resize = (src: Source, w: number, h: number) => {
  const srcʹ = extract(src)
  let wʹ = w * msb(srcʹ.width  / w - 1)
  let hʹ = h * msb(srcʹ.height / h - 1)

  const tmp = context2d({ width: wʹ, height: hʹ })()
  tmp.drawImage(srcʹ, 0, 0, wʹ, hʹ)

  if (w === wʹ && h === hʹ)
    return tmp

  for (let x, y; x = wʹ > w, y = hʹ > h, x || y;)
    tmp.drawImage(tmp.canvas, 0, 0, wʹ, hʹ, 0, 0, wʹ >>= +x, hʹ >>= +y)

  const dst = context2d({ width: w, height: h })()
  dst.drawImage(tmp.canvas, 0, 0)
  return dst
}
