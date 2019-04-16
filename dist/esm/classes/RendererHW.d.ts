import { Renderer, Renderable } from './Renderer';
import { CoreSettings } from './Settings';
export declare class HardwareRenderer extends Renderer {
    private readonly pass1;
    private readonly pass2;
    private readonly gl;
    private readonly fbo;
    private readonly txLUT;
    private readonly txOdd;
    private readonly txEven;
    private readonly lut;
    private indices;
    constructor(settings?: Partial<CoreSettings>);
    lines(renderable: Renderable, width: number, height: number): IterableIterator<string>;
}
