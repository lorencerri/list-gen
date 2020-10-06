const Jimp = require('jimp');

const nestArray = (array = []) => {
	let newArray = array;
	if (!Array.isArray(array[0])) {
		newArray = [array];
	}

	return newArray;
};

const defaultSpacing = (x, y) => [x, y + 40];

class List {
	constructor(lines, options = {}) {
		const {
			initialXY,
			spacing,
			write,
			maxLines,
			firstBG,
			extraBG,
			font,
		} = options;

		if (!Array.isArray(lines))
			throw new TypeError('Expected lines to be an array');

		if (initialXY && !Array.isArray(initialXY))
			throw new TypeError(
				'Expected options:initialXY to be undefined or an array'
			);

		if (spacing && typeof spacing !== 'function')
			throw new TypeError(
				'Expected options:spacing to be undefined or a function'
			);

		if (write && typeof write !== 'string')
			throw new TypeError(
				'Expected options:write to be undefined or a string'
			);

		if (
			maxLines &&
			!Array.isArray(maxLines) &&
			typeof maxLines !== 'string'
		)
			throw new TypeError(
				'Expected options:maxLines to be a undefined, string, or array'
			);

		if (typeof firstBG !== 'string')
			throw new TypeError('Expected options:firstBG to be a string');

		if (extraBG && typeof extraBG !== 'string')
			throw new TypeError(
				'Expected options:extraBG to be undefined or a string'
			);

		if (font && typeof font !== 'string')
			throw new TypeError(
				'Expected options:font to be undefined or a string'
			);

		this.lines = typeof lines === 'string' ? [lines] : lines;
		this.initialXY = nestArray(initialXY || [[0, 0]]);
		this.spacing = spacing || defaultSpacing;
		this.write = write;
		this.maxLines = maxLines || [0, 0];
		this.firstBG = firstBG;
		this.extraBG = extraBG || firstBG;
		this.font = font || Jimp.FONT_SANS_32_BLACK;
	}

	async generate() {
		if (!this.firstBG) throw new Error('No background path specified');

		this.loadedFont = await Jimp.loadFont(this.font);
		if (!this.loadedFont) throw new Error('Unable to load font');

		const remainingLines = [...this.lines];
		const index = 0;

		return this.nextPage(remainingLines, index);
	}

	async nextPage(remainingLines, index, pages = []) {
		const bg = await Jimp.read(index === 0 ? this.firstBG : this.extraBG);
		const pg = index === 0 ? 0 : 1;

		const maxLines = this.maxLines[pg] || this.maxLines[0];
		let XY = this.initialXY[index > 0 && this.initialXY[1] ? 1 : 0];
		let indexOnPage = 0;

		while (remainingLines.length > 0) {
			if (maxLines && indexOnPage >= maxLines) break;

			const line = remainingLines.shift();
			bg.print(this.loadedFont, XY[0], XY[1], line);
			XY = this.spacing(...XY, {
				pageNumber: index,
				remainingLines,
				indexOnPage,
			});

			indexOnPage += 1;
		}

		pages.push(await bg.getBufferAsync(Jimp.MIME_PNG));

		if (this.write) bg.write(`${this.write}${index}-image.jpg`);

		return remainingLines.length === 0
			? pages
			: this.nextPage(remainingLines, pages.length, pages);
	}
}

module.exports = List;
