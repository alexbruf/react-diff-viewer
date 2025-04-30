<p align="center">
  <img src='https://i.ibb.co/DKrGhVQ/Frame-1-1.png' width="100%" alt='React Diff Viewer' />
</p>
<br/>

[![npm version](https://badge.fury.io/js/@alexbruf%2Freact-diff-viewer.svg)](https://badge.fury.io/js/@alexbruf%2Freact-diff-viewer)
[![GitHub license](https://img.shields.io/github/license/praneshr/react-diff-viewer.svg)](https://github.com/alexbruf/react-diff-viewer/blob/master/LICENSE)

A simple and beautiful text diff viewer component made with [Diff](https://github.com/kpdecker/jsdiff) and [React](https://reactjs.org).

Inspired from Github diff viewer, it includes features like split view, inline view, word diff, line highlight and more. It is highly customizable and it supports almost all languages.

**React 18/19 Compatible**

This version of `@alexbruf/react-diff-viewer` is compatible with React v18 and v19, utilizing functional components and hooks internally.

## Install

```bash
yarn add @alexbruf/react-diff-viewer

# or

npm i @alexbruf/react-diff-viewer
```

## Usage

```javascript
import React from 'react';
import ReactDiffViewer from '@alexbruf/react-diff-viewer';
import "@alexbruf/react-diff-viewer/index.css";

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

const App = () => {
  return (
    <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
  );
};

export default App;
```

## Props

| Prop                      | Type            | Default                        | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oldValue                  | `string`        | `''`                           | Old value as string.                                                                                                                                                                                                                                                                                                                                                                                             |
| newValue                  | `string`        | `''`                           | New value as string.                                                                                                                                                                                                                                                                                                                                                                                             |
| splitView                 | `boolean`       | `true`                         | Switch between `unified` and `split` view.                                                                                                                                                                                                                                                                                                                                                                       |
| disableWordDiff           | `boolean`       | `false`                        | Show and hide word diff in a diff line.                                                                                                                                                                                                                                                                                                                                                                          |
| compareMethod             | `DiffMethod`    | `DiffMethod.CHARS`             | JsDiff text diff method used for diffing strings. Check out the [guide](https://github.com/alexbruf/react-diff-viewer/tree/master#text-block-diff-comparison) to use different methods.                                                                                                                                                                                                                          |
| hideLineNumbers           | `boolean`       | `false`                        | Show and hide line numbers.                                                                                                                                                                                                                                                                                                                                                                                      |
| renderContent             | `function`      | `undefined`                    | Render Prop API to render code in the diff viewer. Helpful for [syntax highlighting](#syntax-highlighting)                                                                                                                                                                                                                                                                                                       |
| onLineNumberClick         | `function`      | `undefined`                    | Event handler for line number click. `(lineId: string) => void`                                                                                                                                                                                                                                                                                                                                                  |
| highlightLines            | `array[string]` | `[]`                           | List of lines to be highlighted. Works together with `onLineNumberClick`. Line number are prefixed with `L` and `R` for the left and right section of the diff viewer, respectively. For example, `L-20` means 20th line in the left pane. To highlight a range of line numbers, pass the prefixed line number as an array. For example, `[L-2, L-3, L-4, L-5]` will highlight the lines `2-5` in the left pane. |
| showDiffOnly              | `boolean`       | `true`                         | Shows only the diffed lines and folds the unchanged lines                                                                                                                                                                                                                                                                                                                                                        |
| extraLinesSurroundingDiff | `number`        | `3`                            | Number of extra unchanged lines surrounding the diff. Works along with `showDiffOnly`.                                                                                                                                                                                                                                                                                                                           |
| codeFoldMessageRenderer   | `function`      | `Expand {number} of lines ...` | Render Prop API to render code fold message.                                                                                                                                                                                                                                                                                                                                                                     |
| useDarkTheme              | `boolean`       | `false`                        | To enable/disable dark theme. Applies `.dark-theme` or `.light-theme` class.                                                                                                                                                                                                                                                                                                                                     |
| leftTitle                 | `string`        | `undefined`                    | Column title for left section of the diff in split view. This will be used as the only title in inline view.                                                                                                                                                                                                                                                                                                     |
| rightTitle                | `string`        | `undefined`                    | Column title for right section of the diff in split view. This will be ignored in inline view.                                                                                                                                                                                                                                                                                                                   |
| linesOffset               | `number`        | `0`                            | Number to start count code lines from.                                                                                                                                                                                                                                                                                                                                                                           |

## Instance Methods

The `resetCodeBlocks` method is no longer available as an instance method on the functional component. You can manage the expanded state externally using the `expandedBlocks` state and `onBlockExpand` callback if needed.

## Syntax Highlighting

Syntax highlighting is a bit tricky when combined with diff. Here, React Diff Viewer provides a simple render prop API to handle syntax highlighting. Use `renderContent(content: string) => JSX.Element` and your favorite syntax highlighting library to achieve this.

An example using [Prism JS](https://prismjs.com)

```html
// Load Prism CSS
<link
  href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.css"
/>

// Load Prism JS
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.js"></script>
```

```javascript
import React, { useCallback } from 'react';
import ReactDiffViewer from '@alexbruf/react-diff-viewer';
import "@alexbruf/react-diff-viewer/index.css";

const oldCode = `
const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`;
const newCode = `
const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`;

// PrismJS is assumed to be available globally as 'Prism'
declare var Prism: any;

const App = () => {
  const highlightSyntax = useCallback((str: string): JSX.Element => {
    if (!str || !Prism) return <></>;
    try {
      const language = Prism.highlight(str, Prism.languages.javascript, 'javascript');
      return <span dangerouslySetInnerHTML={{ __html: language }} />;
    } catch (e) {
      console.error('Prism highlighting failed:', e);
      return <span>{str}</span>;
    }
  }, []);

  return (
    <ReactDiffViewer
      oldValue={oldCode}
      newValue={newCode}
      splitView={true}
      renderContent={highlightSyntax}
    />
  );
};

export default App;
```

## Text block diff comparison

Different styles of text block diffing are possible by using the enums corresponding to variou JsDiff methods ([learn more](https://github.com/kpdecker/jsdiff/tree/v4.0.1#api)). The supported methods are as follows.

```javascript
enum DiffMethod {
  CHARS = 'diffChars',
  WORDS = 'diffWords',
  WORDS_WITH_SPACE = 'diffWordsWithSpace',
  LINES = 'diffLines',
  TRIMMED_LINES = 'diffTrimmedLines',
  SENTENCES = 'diffSentences',
  CSS = 'diffCss',
}
```

```javascript
import React from 'react';
import ReactDiffViewer, { DiffMethod } from '@alexbruf/react-diff-viewer';
import "@alexbruf/react-diff-viewer/index.css";

const oldCode = `
{
  "name": "Original name",
  "description": null
}
`;
const newCode = `
{
  "name": "My updated name",
  "description": "Brand new description",
  "status": "running"
}
`;

const App = () => {
  return (
    <ReactDiffViewer
      oldValue={oldCode}
      newValue={newCode}
      compareMethod={DiffMethod.WORDS}
      splitView={true}
    />
  );
};

export default App;
```

## Customizing Styles (CSS Variables)

React Diff Viewer uses SCSS for styling and provides CSS custom properties (variables) for easy customization of colors and backgrounds for both light and dark themes.

The component applies either the `.light-theme` or `.dark-theme` class to the main container based on the `useDarkTheme` prop. You can override the default theme colors by redefining these CSS variables in your own stylesheet.

### Available CSS Variables:

**Light Theme (`.light-theme`)**

```css
.light-theme {
  --diffViewerBackground: #fff;
  --diffViewerColor: #212529;
  --addedBackground: #e6ffed;
  --addedColor: #24292e;
  --removedBackground: #ffeef0;
  --removedColor: #24292e;
  --wordAddedBackground: #acf2bd;
  --wordRemovedBackground: #fdb8c0;
  --addedGutterBackground: #cdffd8;
  --removedGutterBackground: #ffdce0;
  --gutterBackground: #f7f7f7;
  --gutterBackgroundDark: #f3f1f1; /* Used for gutter hover */
  --highlightBackground: #fffbdd;
  --highlightGutterBackground: #fff5b1;
  --codeFoldGutterBackground: #dbedff;
  --codeFoldBackground: #f1f8ff;
  --emptyLineBackground: #fafbfc;
  --gutterColor: #212529;
  --addedGutterColor: #212529;
  --removedGutterColor: #212529;
  --codeFoldContentColor: #212529;
  --diffViewerTitleBackground: #fafbfc;
  --diffViewerTitleColor: #212529;
  --diffViewerTitleBorderColor: #eee;
}
```

**Dark Theme (`.dark-theme`)**

```css
.dark-theme {
  --diffViewerBackground: #2e303c;
  --diffViewerColor: #FFF;
  --addedBackground: #044B53;
  --addedColor: white;
  --removedBackground: #632F34;
  --removedColor: white;
  --wordAddedBackground: #055d67;
  --wordRemovedBackground: #7d383f;
  --addedGutterBackground: #034148;
  --removedGutterBackground: #632b30;
  --gutterBackground: #2c2f3a;
  --gutterBackgroundDark: #262933; /* Used for gutter hover */
  --highlightBackground: #2a3967;
  --highlightGutterBackground: #2d4077;
  --codeFoldGutterBackground: #21232b;
  --codeFoldBackground: #262831;
  --emptyLineBackground: #363946;
  --gutterColor: #464c67;
  --addedGutterColor: #8c8c8c;
  --removedGutterColor: #8c8c8c;
  --codeFoldContentColor: #555a7b;
  --diffViewerTitleBackground: #2f323e;
  --diffViewerTitleColor: #555a7b;
  --diffViewerTitleBorderColor: #353846;
}
```

### Example Override:

To change the added background color for the dark theme, you can add the following to your CSS:

```css
.diff-container.dark-theme {
  --addedBackground: #0a5c2f; /* Your custom color */
}
```

Make sure your custom styles are loaded *after* the component's default styles or have higher specificity.

## Local Development

First, make sure you have Bun installed. If not, follow the instructions on the [Bun website](https://bun.sh/docs/installation).

```bash
bun install
bun run build # or use bun run build:watch
bun run start:examples
```

Check package.json for more build scripts.

## License

MIT
