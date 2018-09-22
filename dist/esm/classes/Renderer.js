import { Setup } from './shaders/Setup';
import { Pass1 } from './shaders/Pass1';
import { Pass2 } from './shaders/Pass2';
export class Renderer {
    constructor(ascii) {
        this.ascii = ascii;
        this.bytes = new Uint8Array(1);
        const { regl } = ascii;
        this.src = regl.texture();
        this.lut = regl.texture();
        this.fbo1 = regl.framebuffer({ depthStencil: false, colorType: 'float' });
        this.fbo2 = regl.framebuffer({ depthStencil: false });
        this.setup = new Setup(regl);
        this.pass1 = new Pass1(regl);
        this.pass2 = new Pass2(regl);
    }
    update() {
        const { ascii } = this;
        this.lut({
            format: 'alpha',
            type: 'float',
            data: ascii.luts
        });
        this.setup.compile(ascii);
        this.pass1.compile(ascii);
        this.pass2.compile(ascii);
    }
    render(renderable, width, height) {
        const { ascii, src, lut, fbo1, fbo2 } = this;
        const { regl, settings } = ascii;
        const { brightness, gamma, noise } = settings;
        const w = settings.lutWidth * width;
        const h = settings.lutHeight * height;
        const length = width * height << 2;
        if (this.bytes.length !== length)
            this.bytes = new Uint8Array(length);
        src(renderable);
        fbo1.resize(w, h);
        fbo2.resize(width, height);
        regl.poll();
        this.setup.command(() => {
            this.pass1.command({ dst: fbo1, src, brightness, gamma, noise });
            this.pass2.command({ dst: fbo2, src: fbo1, lut }, () => {
                regl.draw();
                regl.read(this.bytes);
            });
        });
        return this.bytes;
    }
}
