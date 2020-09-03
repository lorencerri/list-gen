/**
 * List generator based on JIMP
 * @param { string[] } lines - Array of text
 * @param { number } maxLines - Maximum amount of lines per page
 */

const Jimp = require('jimp');

class List {
    constructor(config) {
        const { lines, fontPath, first, extra } = config;

        this.lines = lines.filter(i => i !== null);
        this.font = fontPath || Jimp.FONT_SANS_32_BLACK;
        this.buffers = [];

        this.first = {
            offset: {
                x: first.offset.x || 0,
                y: first.offset.y || 0
            },
            interval: { x: first.interval.x || 0, y: first.interval.y || 50 },
            background: first.background,
            maxLines: first.maxLines || 100
        };
        this.extra = {
            offset: {
                x: extra.offset.x || 0,
                y: extra.offset.y || 0
            },
            interval: { x: extra.interval.x || 0, y: extra.interval.y || 50 },
            background: extra.background || first.background,
            maxLines: extra.maxLines || 100
        };

        this.page = 1;
        this.num = 1;
    }

    generate() {
        return new Promise(async (resolve, reject) => {
            this.font = await Jimp.loadFont(this.font);
            if (!this.font) throw new Error('Unable to load font.');

            if (!this.first.background)
                throw new Error('No background path specified');

            while (this.lines.length > 0) {
                console.log(
                    `Generating page ${this.page}, ${this.lines.length} lines remaining`
                );

                let state = this.extra;
                let buffer = await this.next_page();
                this.buffers.push(buffer);
                this.extra = state;
            }

            resolve(this.buffers);
        });
    }

    async next_page() {
        return new Promise(async (resolve, reject) => {
            const ctx = this[this.page === 1 ? 'first' : 'extra'];
            const image = await Jimp.read(ctx.background);

            let iter = 1;
            while (this.lines.length > 0 && iter <= ctx.maxLines) {
                this.first.offset.y += iter % 6 == 0 ? 2 : 0; // Custom

                let line = this.lines.shift();

                image.print(
                    this.font,
                    ctx.offset.x + ctx.interval.x * iter,
                    ctx.offset.y + ctx.interval.y * iter,
                    line
                );

                iter++;
            }

            let buffer = await image.getBufferAsync(Jimp.MIME_PNG);

            resolve(buffer);
        });
    }
}

module.exports = List;
