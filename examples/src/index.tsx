import './style.scss';
import * as React from 'react';
import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot

import ReactDiff, { DiffMethod } from '../../lib/index';

const oldJs = require('./diff/javascript/old.rjs').default;
const newJs = require('./diff/javascript/new.rjs').default;

const logo = require('../../logo.png');

// PrismJS for syntax highlighting (assuming it's loaded globally or via other means)
const P = (window as any).Prism;

const Example: React.FC = () => {
	const [highlightLine, setHighlightLine] = useState<string[]>([]);
	// enableSyntaxHighlighting state seems unused in the original code, omitting for now unless needed.
	// const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState<boolean>(true);

	const onLineNumberClick = useCallback(
		(id: string, e: React.MouseEvent<HTMLTableCellElement>): void => {
			let newHighlightLine = [id];
			if (e.shiftKey && highlightLine.length === 1) {
				const [dir, oldId] = highlightLine[0].split('-');
				const [newDir, newId] = id.split('-');
				if (dir === newDir) {
					newHighlightLine = [];
					const lowEnd = Math.min(Number(oldId), Number(newId));
					const highEnd = Math.max(Number(oldId), Number(newId));
					for (let i = lowEnd; i <= highEnd; i++) {
						newHighlightLine.push(`${dir}-${i}`);
					}
				}
			}
			setHighlightLine(newHighlightLine);
		},
		[highlightLine], // Add highlightLine to dependency array
	);

	const syntaxHighlight = useCallback((str: string): JSX.Element => {
		// Return an empty fragment if str is empty or Prism is unavailable
		if (!str || !P) return <></>;
		try {
			const language = P.highlight(str, P.languages.javascript, 'javascript');
			return <span dangerouslySetInnerHTML={{ __html: language }} />;
		} catch (e) {
			console.error('Prism highlighting failed:', e);
			// Fallback to plain text rendering
			return <span>{str}</span>;
		}
	}, []); // Empty dependency array as Prism is assumed global/static

	return (
		<div className="react-diff-viewer-example">
			<div className="radial"></div>
			<div className="banner">
				<div className="img-container">
					<img src={logo as string} alt="React Diff Viewer Logo" />
				</div>
				<p>
					A simple and beautiful text diff viewer made with{' '}
					<a href="https://github.com/kpdecker/jsdiff" target="_blank" rel="noopener noreferrer">
						Diff{' '}
					</a>
					and{' '}
					<a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
						React.{' '}
					</a>
					Featuring split view, inline view, word diff, line highlight and more.
				</p>
				<div className="cta">
					<a href="https://github.com/praneshr/react-diff-viewer#install">
						<button type="button" className="btn btn-primary btn-lg">
							Documentation
						</button>
					</a>
				</div>
			</div>
			<div className="diff-viewer">
				<ReactDiff
					highlightLines={highlightLine}
					onLineNumberClick={onLineNumberClick}
					oldValue={oldJs}
					splitView // Default is true, kept for clarity
					newValue={newJs}
					renderContent={syntaxHighlight}
					useDarkTheme
					leftTitle="webpack.config.js master@2178133 - pushed 2 hours ago."
					rightTitle="webpack.config.js master@64207ee - pushed 13 hours ago."
				/>
			</div>
			<footer>
				Made with 💓 by{' '}
				<a href="https://praneshravi.in" target="_blank" rel="noopener noreferrer">
					Pranesh Ravi
				</a>
			</footer>
		</div>
	);
};

// Use createRoot API for React 18+
const container = document.getElementById('app');
if (container) {
	const root = createRoot(container);
	root.render(<Example />);
} else {
	console.error("Failed to find the root element with ID 'app'");
}
