import { resize } from '../canvas';
import * as gle from '../gl/enums';
import * as glu from '../gl/utils';
import { frag, vert } from '../shaders';
import { render, str } from '../utils';
import { LUT } from './LUT';
import { Renderer } from './Renderer';
const filterNearest = gl => {
    gl.texParameteri(gle.TEXTURE_2D, gle.TEXTURE_MIN_FILTER, gle.NEAREST);
    gl.texParameteri(gle.TEXTURE_2D, gle.TEXTURE_MAG_FILTER, gle.NEAREST);
};
const quadGeometry = (index) => gl => {
    const quad = Float32Array.of(1, 1, -1, 1, 1, -1, -1, -1);
    gl.bufferData(gle.ARRAY_BUFFER, quad, gle.STATIC_DRAW);
    gl.vertexAttribPointer(index, 2, gle.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(index);
};
export class GPURenderer extends Renderer {
    constructor(settings) {
        super(settings);
        this._gl = glu.api({}, 'EXT_color_buffer_float');
        this._fbo = glu.framebuffer(this._gl)();
        this._txLUT = glu.texture(this._gl)(filterNearest);
        this._txOdd = glu.texture(this._gl)(filterNearest);
        this._txEven = glu.texture(this._gl)(filterNearest);
        this._lut = LUT.combine(this._luts);
        this._charCodes = new Float32Array();
        const vBase = glu.shader(this._gl, gle.VERTEX_SHADER, vert.base);
        const fPass1 = glu.shader(this._gl, gle.FRAGMENT_SHADER, frag.pass1);
        const fPass2 = glu.shader(this._gl, gle.FRAGMENT_SHADER, render(frag.pass2, {
            chars: this._charMap.length,
            width: this.settings.lutWidth,
            height: this.settings.lutHeight
        }));
        this._pass1 = glu.program(this._gl, vBase, fPass1);
        this._pass2 = glu.program(this._gl, vBase, fPass2);
        glu.buffer(this._gl)(quadGeometry(0 /* position */));
    }
    *lines(src, width, height) {
        const { settings, _charMap, _lut, _gl, _pass1, _pass2, _fbo, _txLUT, _txOdd, _txEven } = this;
        const srcWidth = settings.lutWidth * width;
        const srcHeight = settings.lutHeight * height;
        const srcʹ = resize(src, srcWidth, srcHeight);
        const uPass1 = glu.uniforms(_gl, _pass1);
        const uPass2 = glu.uniforms(_gl, _pass2);
        if (this._charCodes.length !== width * height)
            this._charCodes = new Float32Array(width * height);
        // enable framebuffer
        _gl.bindFramebuffer(gle.FRAMEBUFFER, _fbo);
        // 1st pass
        _gl.activeTexture(gle.TEXTURE0 + 2 /* lut */);
        _gl.bindTexture(gle.TEXTURE_2D, _txLUT);
        _gl.texImage2D(gle.TEXTURE_2D, 0, gle.R32F, _lut.width, _lut.height, 0, gle.RED, gle.FLOAT, _lut);
        _gl.activeTexture(gle.TEXTURE0 + 1 /* src */);
        _gl.bindTexture(gle.TEXTURE_2D, _txOdd);
        _gl.texImage2D(gle.TEXTURE_2D, 0, gle.RGBA, gle.RGBA, gle.UNSIGNED_BYTE, srcʹ.canvas);
        _gl.activeTexture(gle.TEXTURE0 + 0 /* dst */);
        _gl.bindTexture(gle.TEXTURE_2D, _txEven);
        _gl.texImage2D(gle.TEXTURE_2D, 0, gle.R32F, srcWidth, srcHeight, 0, gle.RED, gle.FLOAT, null);
        _gl.framebufferTexture2D(gle.FRAMEBUFFER, gle.COLOR_ATTACHMENT0, gle.TEXTURE_2D, _txEven, 0);
        _gl.useProgram(_pass1);
        _gl.uniform1i(uPass1('uSrc'), 1 /* src */);
        _gl.uniform1f(uPass1('uBrightness'), settings.brightness);
        _gl.uniform1f(uPass1('uGamma'), settings.gamma);
        _gl.uniform1f(uPass1('uNoise'), settings.noise);
        _gl.uniform1f(uPass1('uRandom'), Math.random());
        _gl.viewport(0, 0, srcWidth, srcHeight);
        _gl.drawArrays(gle.TRIANGLE_STRIP, 0, 4);
        // 2nd pass
        _gl.activeTexture(gle.TEXTURE0 + 1 /* src */);
        _gl.bindTexture(gle.TEXTURE_2D, _txEven);
        _gl.activeTexture(gle.TEXTURE0 + 0 /* dst */);
        _gl.bindTexture(gle.TEXTURE_2D, _txOdd);
        _gl.texImage2D(gle.TEXTURE_2D, 0, gle.R32F, srcWidth, srcHeight, 0, gle.RED, gle.FLOAT, null);
        _gl.framebufferTexture2D(gle.FRAMEBUFFER, gle.COLOR_ATTACHMENT0, gle.TEXTURE_2D, _txOdd, 0);
        _gl.useProgram(_pass2);
        _gl.uniform1i(uPass2('uSrc'), 1 /* src */);
        _gl.uniform1i(uPass2('uLUT'), 2 /* lut */);
        _gl.uniform1iv(uPass2('uCharMap'), _charMap);
        _gl.viewport(0, 0, width, height);
        _gl.drawArrays(gle.TRIANGLE_STRIP, 0, 4);
        // read from framebuffer
        _gl.readPixels(0, 0, width, height, gle.RED, gle.FLOAT, this._charCodes);
        // disable framebuffer
        _gl.bindFramebuffer(gle.FRAMEBUFFER, null);
        for (let i = 0; i < this._charCodes.length;)
            yield str(...this._charCodes.subarray(i, i += width));
    }
}
//# sourceMappingURL=GPURenderer.js.map