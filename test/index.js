const test = require('ava');
const path = require('path');
const List = require('..');
const Jimp = require('jimp');

test('lines parameter empty', t => {
	try {
		// eslint-disable-next-line no-new
		new List();
	} catch (error) {
		return t.is(error.message, 'Expected lines to be an array');
	}

	t.fail();
});

// Output: ./output/todolist/#-image.jpg
test('generate with todo list theme', async t => {
	const list = new List(
		[...new Array(22)].map((_, i) => `Item #${i}`),
		{
			initialXY: [420, 420],
			spacing: (x, y) => [x, y + 96.3],
			firstBG: path.join(__dirname, '/resources/todolist/todolist.jpg'),
			write: path.join(__dirname, '/output/todolist/'),
			font: Jimp.FONT_SANS_128_BLACK
		}
	);

	t.true(typeof list === 'object');
	const results = await list.generate();
	t.true(results.every(i => Buffer.isBuffer(i)));
});

// Output: ./output/hypnospace/#-image.jpg
test('generate with hypnospace theme', async t => {
	const list = new List(
		[...new Array(200)].map((_, i) => `Item #${i}`),
		{
			initialXY: [
				[60, 280], // Page 1
				[60, 10] // Page >= 2
			],
			spacing: (x, y, {remainingLines, pageNumber}) => {
				if (pageNumber === 0) {
					y += remainingLines.length % 6 === 0 ? 2 : 0; // Every 6 items on the first page, add 2 to the y position
				}

				return [x, y + 40];
			},
			maxLines: [41, 48],
			write: path.join(__dirname, '/output/hypnospace/'),
			firstBG: path.join(__dirname, '/resources/hypnospace/first.png'),
			extraBG: path.join(__dirname, '/resources/hypnospace/extra.png'),
			font: path.join(__dirname, '/resources/hypnospace/hypnoverse.fnt')
		}
	);

	t.true(typeof list === 'object');
	const results = await list.generate();
	t.true(results.every(i => Buffer.isBuffer(i)));
});
