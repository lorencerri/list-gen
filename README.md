# list-image-generator

A simple list (image) generator, using JIMP.

---

### Examples

*`yarn test` or `npm run test` to compile these yourself...*

**1. Basic todo list** | [Output](https://github.com/lorencerri/list-image-gen/tree/rewrite/test/output/todolist)
```js
const list = new List(
    [...new Array(22)].map((_, i) => `Item #${i}`), {
        initialXY: [420, 420],
        spacing: (x, y) => [x, y + 96.3],
        firstBG: path.join(__dirname, '/resources/todolist/todolist.jpg'),
        write: path.join(__dirname, '/output/todolist/'),
        font: Jimp.FONT_SANS_128_BLACK
    }
);
await list.generate();
 ```
 
 **2. Pixel Art Theme** | [Output](https://github.com/lorencerri/list-image-gen/tree/rewrite/test/output/hypnospace)
 ```js
 const list = new List(
    [...new Array(200)].map((_, i) => `Item #${i}`), {
        initialXY: [
            [60, 280], // Page 1
            [60, 10] // Page >= 2
        ],
        spacing: (x, y, {
            remainingLines,
            pageNumber
        }) => {
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
await list.generate();
```
