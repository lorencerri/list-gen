/* eslint-disable no-param-reassign */
const test = require('ava');
const path = require('path');
const Jimp = require('jimp');
const List = require('..');

test('lines parameter empty', t => {
	try {
		// eslint-disable-next-line no-new
		new List();
	} catch (error) {
		return t.is(error.message, 'Expected lines to be an array');
	}

	t.fail();
});

test('first background parameter not specified', t => {
	try {
		// eslint-disable-next-line no-new
		new List(['Hello', 'World']);
	} catch (error) {
		return t.is(error.message, 'Expected options:firstBG to be a string');
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
			firstBG: path.join(__dirname, '/resources/todolist.jpg'),
			write: path.join(__dirname, '/output/todolist/'),
			font: Jimp.FONT_SANS_128_BLACK,
		}
	);

	t.true(typeof list === 'object');
	const results = await list.generate();
	t.true(results.every(i => Buffer.isBuffer(i)));
});

// Output: ./output/pixelart/#-image.jpg
test('generate with pixel art theme', async t => {
	const list = new List(
		[...new Array(200)].map((_, i) => `Item #${i}`),
		{
			initialXY: [
				[60, 280], // Page 1
				[60, 10], // Page >= 2
			],
			spacing: (x, y, {remainingLines, pageNumber}) => {
				if (pageNumber === 0) {
					y += remainingLines.length % 6 === 0 ? 2 : 0; // Every 6 items on the first page, add 2 to the y position
				}

				return [x, y + 40];
			},
			maxLines: [41, 48],
			write: path.join(__dirname, '/output/pixelart/'),
			firstBG: path.join(__dirname, '/resources/first.png'),
			extraBG: path.join(__dirname, '/resources/extra.png'),
			font: path.join(__dirname, '/resources/hypnoverse.fnt'),
		}
	);
	t.true(typeof list === 'object');

	const results = await list.generate();
	t.true(results.every(i => Buffer.isBuffer(i)));
});

// Output: ./output/staircase/#-image.jpg
test('generate with staircase theme', async t => {
	const list = new List(
		[...new Array(10)].map((_, i) => `User ${i}`),
		{
			initialXY: [0, 5],
			spacing: (x, y) => [x + 100, y + 25],
			write: path.join(__dirname, '/output/staircase/'),
			firstBG: path.join(__dirname, '/resources/background.png'),
		}
	);
	t.true(typeof list === 'object');

	const results = await list.generate();
	t.true(results.every(i => Buffer.isBuffer(i)));
});

// Output: ./output/pixelart-rightalign/#-image.jpg
test('pixelart theme plus right align text', async t => {
	const number = () => String(Math.floor(Math.random() * 9999));
	const ws = (base, offsets) => {
		const offset = offsets.reduce(
			(acc, cur) => acc + (cur.length || cur),
			0
		);
		return ' '.repeat(base - offset > 0 ? base - offset : 0);
	};

	const lines = [...new Array(100)].map((_, i) => {
		const n = String(number());
		const p = `Server ${i}`;
		return `${p}${ws(53, [n, p])}${n}`;
	});

	const list = new List(
		[`Server Name${' '.repeat(30)}Member Count`, ...lines],
		{
			initialXY: [
				[60, 280], // Page 1
				[60, 10], // Page >= 2
			],
			spacing: (x, y, {indexOnPage, pageNumber}) => {
				y += pageNumber === 0 && indexOnPage % 6 === 0 ? 2 : 0; // Every 6 items on the first page, add 2 to the y position
				return [x, y + 40];
			},
			maxLines: [41, 48],
			write: path.join(__dirname, '/output/pixelart-rightalign/'),
			firstBG: path.join(__dirname, '/resources/first.png'),
			extraBG: path.join(__dirname, '/resources/extra.png'),
			font: path.join(__dirname, '/resources/hypnoverse.fnt'),
		}
	);

	const res = await list.generate();
	t.true(res.every(i => Buffer.isBuffer(i)));
});
