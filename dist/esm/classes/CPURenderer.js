import { converter } from "../lib/canvas/basic.js";
import { random } from "../lib/math.js";
import { lum, rgb } from "../lib/srgb.js";
import { str } from "../lib/utils.js";
import { LUT } from "./LUT.js";
import { Renderer } from "./Renderer.js";
export class CPURenderer extends Renderer {
    constructor() {
        super(...arguments);
        this._convert = converter();
    }
    *_lines(src, width, height) {
        const { settings, _charMap, _luts, _resize, _convert } = this;
        const { lutWidth, lutHeight, gamma, signal, noise } = settings;
        const srcWidth = lutWidth * width;
        const srcHeight = lutHeight * height;
        const srcʹ = _convert(_resize(src, srcWidth, srcHeight));
        const rgba = srcʹ.getImageData(0, 0, srcWidth, srcHeight).data;
        const buffer = new LUT(lutWidth, lutHeight);
        for (let y = 0; y < srcHeight; y += lutHeight) {
            const codes = [];
            for (let x = 0; x < srcWidth; x += lutWidth) {
                let index = 0;
                let value = Infinity;
                for (let v = 0; v < lutHeight; v++) {
                    for (let u = 0; u < lutWidth; u++) {
                        let i = x + u + (y + v) * srcWidth << 2;
                        const r = rgb(rgba[i++] / 0xff);
                        const g = rgb(rgba[i++] / 0xff);
                        const b = rgb(rgba[i++] / 0xff);
                        const s = lum(r, g, b) ** gamma;
                        const n = random() - 0.5;
                        buffer[index++] = signal * s + noise * n;
                    }
                }
                for (let i = _luts.length; i--;) {
                    const delta = _luts[i].compare(buffer);
                    if (delta < value) {
                        value = delta;
                        index = i;
                    }
                }
                codes.push(_charMap[index]);
            }
            yield str(...codes);
        }
    }
}
//# sourceMappingURL=CPURenderer.js.map