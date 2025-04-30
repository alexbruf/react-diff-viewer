import * as React from 'react';
import { useState, useCallback } from 'react';
import cn from 'classnames';

import {
	computeLineInformation,
	LineInformation,
	DiffInformation,
	DiffType,
	DiffMethod,
} from './compute-lines';
// Import SCSS styles
import './styles.css';

export enum LineNumberPrefix {
	LEFT = 'L',
	RIGHT = 'R',
}

export interface ReactDiffViewerProps {
	// Old value to compare.
	oldValue: string;
	// New value to compare.
	newValue: string;
	// Enable/Disable split view.
	splitView?: boolean;
	// Set line Offset
	linesOffset?: number;
	// Enable/Disable word diff.
	disableWordDiff?: boolean;
	// JsDiff text diff method from https://github.com/kpdecker/jsdiff/tree/v4.0.1#api
	compareMethod?: DiffMethod;
	// Number of unmodified lines surrounding each line diff.
	extraLinesSurroundingDiff?: number;
	// Show/hide line number.
	hideLineNumbers?: boolean;
	// Show only diff between the two values.
	showDiffOnly?: boolean;
	// Render prop to format final string before displaying them in the UI.
	renderContent?: (source: string) => JSX.Element | undefined | null;
	// Render prop to format code fold message.
	codeFoldMessageRenderer?: (
		totalFoldedLines: number,
		leftStartLineNumber: number,
		rightStartLineNumber: number,
	) => JSX.Element;
	// Event handler for line number click.
	onLineNumberClick?: (
		lineId: string,
		event: React.MouseEvent<HTMLTableCellElement>,
	) => void;
	// Array of line ids to highlight lines.
	highlightLines?: string[];
	// Use dark theme.
	useDarkTheme?: boolean;
	// Title for left column
	leftTitle?: string | JSX.Element;
	// Title for left column
	rightTitle?: string | JSX.Element;
}

// Default props added to the function component definition
const DiffViewer: React.FC<ReactDiffViewerProps> = ({
	oldValue,
	newValue,
	splitView = true,
	linesOffset = 0,
	disableWordDiff = false,
	compareMethod = DiffMethod.CHARS,
	extraLinesSurroundingDiff = 3,
	hideLineNumbers = false,
	showDiffOnly = true,
	renderContent,
	codeFoldMessageRenderer,
	onLineNumberClick,
	highlightLines = [],
	useDarkTheme = false,
	leftTitle,
	rightTitle,
}) => {
	// Use useState for managing expanded blocks
	const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

	// Use useCallback for expanding blocks
	const onBlockExpand = useCallback(
		(id: number): void => {
			setExpandedBlocks((prevState) => [...prevState, id]);
		},
		[setExpandedBlocks], // Dependency array includes setExpandedBlocks
	);

	// Use useCallback for line number click handler
	const onLineNumberClickProxy = useCallback(
		(id: string) => (e: React.MouseEvent<HTMLTableCellElement>): void => {
			if (onLineNumberClick) {
				onLineNumberClick(id, e);
			}
		},
		[onLineNumberClick], // Dependency array includes onLineNumberClick
	);

	// Use useCallback for rendering word diffs
	const renderWordDiff = useCallback(
		(
			diffArray: DiffInformation[],
			renderer?: (chunk: string) => JSX.Element,
		): JSX.Element[] => {
			return diffArray.map(
				(wordDiff, i): JSX.Element => {
					return (
						<span
							key={i}
							className={cn('word-diff', {
								'word-added': wordDiff.type === DiffType.ADDED,
								'word-removed': wordDiff.type === DiffType.REMOVED,
							})}>
							{/* Use renderer if provided, otherwise render the value directly */}
							{renderer ? renderer(wordDiff.value as string) : `${wordDiff.value}`}
						</span>
					);
				},
			);
		},
		[renderContent], // Removed styles from dependencies
	);

	// Use useCallback for rendering a single line
	const renderLine = useCallback(
		(
			lineNumber: number | null, // Allow null for placeholder lines
			type: DiffType,
			prefix: LineNumberPrefix,
			value: string | DiffInformation[],
			additionalLineNumber?: number | null, // Allow null
			additionalPrefix?: LineNumberPrefix,
		): JSX.Element => {
			const lineNumberTemplate = `${prefix}-${lineNumber}`;
			const additionalLineNumberTemplate = `${additionalPrefix}-${additionalLineNumber}`;
			const highlightLine =
				(lineNumber !== null && highlightLines.includes(lineNumberTemplate)) ||
				(additionalLineNumber !== null && highlightLines.includes(additionalLineNumberTemplate));
			const added = type === DiffType.ADDED;
			const removed = type === DiffType.REMOVED;
			let content;
			if (Array.isArray(value)) {
				content = renderWordDiff(value, renderContent);
			} else if (renderContent) {
				content = renderContent(value);
			} else {
				content = value;
			}
			content = content ?? <></>;

			return (
				<React.Fragment>
					{!hideLineNumbers && (
						<td
							onClick={
								lineNumber !== null
									? onLineNumberClickProxy(lineNumberTemplate)
									: undefined
							}
							className={cn('gutter', {
								'empty-gutter': !lineNumber,
								'diff-added': added,
								'diff-removed': removed,
								'highlighted-gutter': highlightLine,
							})}>
							<pre className={'line-number'}>{lineNumber}</pre>
						</td>
					)}
					{!splitView && !hideLineNumbers && (
						<td
							onClick={
								additionalLineNumber !== null
									? onLineNumberClickProxy(additionalLineNumberTemplate)
									: undefined
							}
							className={cn('gutter', {
								'empty-gutter': !additionalLineNumber,
								'diff-added': added,
								'diff-removed': removed,
								'highlighted-gutter': highlightLine,
							})}>
							<pre className={'line-number'}>{additionalLineNumber}</pre>
						</td>
					)}
					<td
						className={cn('marker', {
							'empty-line': !content,
							'diff-added': added,
							'diff-removed': removed,
							'highlighted-line': highlightLine,
						})}>
						<pre>
							{added && '+'}
							{removed && '-'}
						</pre>
					</td>
					<td
						className={cn('content', {
							'empty-line': !content,
							'diff-added': added,
							'diff-removed': removed,
							'highlighted-line': highlightLine,
						})}>
						<pre className={'content-text'}>{content}</pre>
					</td>
				</React.Fragment>
			);
		},
		[
			hideLineNumbers,
			splitView,
			highlightLines,
			renderWordDiff,
			renderContent,
			onLineNumberClickProxy,
		], // Removed styles from dependencies
	);

	// Use useCallback for rendering split view lines
	const renderSplitView = useCallback(
		({ left, right }: LineInformation, index: number): JSX.Element => {
			return (
				<tr key={index} className={'line'}>
					{renderLine(
						left.lineNumber,
						left.type,
						LineNumberPrefix.LEFT,
						left.value,
					)}
					{renderLine(
						right.lineNumber,
						right.type,
						LineNumberPrefix.RIGHT,
						right.value,
					)}
				</tr>
			);
		},
		[renderLine], // Removed styles from dependencies
	);

	// Use useCallback for rendering inline view lines
	const renderInlineView = useCallback(
		({ left, right }: LineInformation, index: number): JSX.Element => {
			let content;
			if (left.type === DiffType.REMOVED && right.type === DiffType.ADDED) {
				return (
					<React.Fragment key={index}>
						<tr className={'line'}>
							{renderLine(
								left.lineNumber,
								left.type,
								LineNumberPrefix.LEFT,
								left.value,
								null, // No additional line number for removed line
							)}
						</tr>
						<tr className={'line'}>
							{renderLine(
								null, // No line number for added line gutter
								right.type,
								LineNumberPrefix.RIGHT,
								right.value,
								right.lineNumber, // Use right line number as additional
							)}
						</tr>
					</React.Fragment>
				);
			}
			if (left.type === DiffType.REMOVED) {
				content = renderLine(
					left.lineNumber,
					left.type,
					LineNumberPrefix.LEFT,
					left.value,
					null, // No additional line number
				);
			}
			if (left.type === DiffType.DEFAULT) {
				content = renderLine(
					left.lineNumber,
					left.type,
					LineNumberPrefix.LEFT,
					left.value,
					right.lineNumber, // Add right line number as additional
					LineNumberPrefix.RIGHT,
				);
			}
			if (right.type === DiffType.ADDED) {
				content = renderLine(
					null, // No line number for added line gutter
					right.type,
					LineNumberPrefix.RIGHT,
					right.value,
					right.lineNumber, // Use right line number as additional
				);
			}

			return (
				<tr key={index} className={'line'}>
					{content}
				</tr>
			);
		},
		[renderLine], // Removed styles from dependencies
	);

	// Use useCallback for the block click proxy
	const onBlockClickProxy = useCallback(
		(id: number) => (): void => onBlockExpand(id),
		[onBlockExpand], // Dependency array includes onBlockExpand
	);

	// Use useCallback for rendering the skipped line indicator
	const renderSkippedLineIndicator = useCallback(
		(
			num: number,
			blockNumber: number,
			leftBlockLineNumber: number,
			rightBlockLineNumber: number,
		): JSX.Element => {
			const message = codeFoldMessageRenderer ? (
				codeFoldMessageRenderer(
					num,
					leftBlockLineNumber,
					rightBlockLineNumber,
				)
			) : (
				<pre className={'code-fold-content'}>Expand {num} lines ...</pre>
			);
			const content = (
				<td>
					<a onClick={onBlockClickProxy(blockNumber)} tabIndex={0}>
						{message}
					</a>
				</td>
			);
			const isUnifiedViewWithoutLineNumbers = !splitView && !hideLineNumbers;
			return (
				<tr
					key={`${leftBlockLineNumber}-${rightBlockLineNumber}`}
					className={'code-fold'}>
					{!hideLineNumbers && <td className={'code-fold-gutter'} />}
					<td
						className={cn({
							'code-fold-gutter': isUnifiedViewWithoutLineNumbers,
						})}
					/>

					{/* Swap columns only for unified view without line numbers */}
					{isUnifiedViewWithoutLineNumbers ? (
						<React.Fragment>
							<td />
							{content}
						</React.Fragment>
					) : (
						<React.Fragment>
							{content}
							<td />
						</React.Fragment>
					)}

					<td />
					<td />
				</tr>
			);
		},
		[
			hideLineNumbers,
			splitView,
			codeFoldMessageRenderer,
			onBlockClickProxy,
		], // Removed styles from dependencies
	);

	// Use useCallback for rendering the main diff view
	const renderDiff = useCallback((): (JSX.Element | null)[] => {
		// Compute line info inside useCallback to ensure it uses the latest props
		const { lineInformation, diffLines } = computeLineInformation(
			oldValue,
			newValue,
			disableWordDiff,
			compareMethod,
			linesOffset,
		);
		// Clone diffLines to avoid modifying the original array during processing
		const remainingDiffLines = [...diffLines];
		const validExtraLines = extraLinesSurroundingDiff < 0 ? 0 : extraLinesSurroundingDiff;
		let skippedLines: number[] = [];

		return lineInformation.map(
			(line: LineInformation, i: number): JSX.Element | null => {
				const currentDiffBlockStart = remainingDiffLines[0];
				const currentPosition = currentDiffBlockStart - i;

				if (showDiffOnly) {
					// Check if the current line is a default line and should be skipped
					const isSkipped =
						line.left.type === DiffType.DEFAULT &&
						(currentPosition > validExtraLines || typeof currentDiffBlockStart === 'undefined') &&
						!expandedBlocks.includes(currentDiffBlockStart); // Check if the block is collapsed

					if (isSkipped) {
						skippedLines.push(i); // Store index

						// If it's the last line and we have skipped lines, render the indicator
						if (i === lineInformation.length - 1 && skippedLines.length > 0) {
							const firstSkippedIndex = skippedLines[0];
							const numSkipped = skippedLines.length;
							const leftNum = lineInformation[firstSkippedIndex].left.lineNumber;
							const rightNum = lineInformation[firstSkippedIndex].right.lineNumber;
							skippedLines = []; // Reset
							return renderSkippedLineIndicator(
								numSkipped,
								currentDiffBlockStart, // Use the block ID
								leftNum,
								rightNum,
							);
						}
						// Otherwise, continue skipping
						return null;
					} else {
						// If the current line is not skipped and the previous line was skipped, render the indicator
						if (skippedLines.length > 0) {
							const firstSkippedIndex = skippedLines[0];
							const numSkipped = skippedLines.length;
							const leftNum = lineInformation[firstSkippedIndex].left.lineNumber;
							const rightNum = lineInformation[firstSkippedIndex].right.lineNumber;
							skippedLines = []; // Reset

							const indicator = renderSkippedLineIndicator(
								numSkipped,
								currentDiffBlockStart, // Use the block ID
								leftNum,
								rightNum,
							);

							// Render the current line after the indicator
							const nodes = splitView
								? renderSplitView(line, i)
								: renderInlineView(line, i);

							return (
								<React.Fragment key={i}>
									{indicator}
									{nodes}
								</React.Fragment>
							);
						}
					}

					// Shift to the next diff block when necessary
					if (currentPosition === -validExtraLines) {
						remainingDiffLines.shift();
					}
				}

				// Render the current line normally if not skipping
				return splitView
					? renderSplitView(line, i)
					: renderInlineView(line, i);
			},
		);
	}, [
		oldValue,
		newValue,
		splitView,
		disableWordDiff,
		compareMethod,
		linesOffset,
		extraLinesSurroundingDiff,
		showDiffOnly,
		expandedBlocks, // Include expandedBlocks in dependencies
		renderSkippedLineIndicator,
		renderSplitView,
		renderInlineView,
	]);

	// Compute final diff lines
	const diffNodes = renderDiff();

	// Prepare title block if titles are provided
	const title = (leftTitle || rightTitle) && (
		<tr>
			{!hideLineNumbers && <td className={'title-block'} />}
			<td colSpan={hideLineNumbers || !splitView ? 1 : 2} className={'title-block'}>
				<pre className={'content-text'}>{leftTitle}</pre>
			</td>
			{splitView && (
				<React.Fragment>
					{!hideLineNumbers && <td className={'title-block'} />}
					<td colSpan={hideLineNumbers ? 1 : 2} className={'title-block'}>
						<pre className={'content-text'}>{rightTitle}</pre>
					</td>
				</React.Fragment>
			)}
		</tr>
	);


	return (
		<table
			className={cn('diff-container', {
				'split-view': splitView,
				'light-theme': !useDarkTheme,
				'dark-theme': useDarkTheme,
			})}>
			{title}
			<tbody>{diffNodes}</tbody>
		</table>
	);
};

// Set default props for the functional component
DiffViewer.defaultProps = {
	splitView: true,
	linesOffset: 0,
	disableWordDiff: false,
	compareMethod: DiffMethod.CHARS,
	extraLinesSurroundingDiff: 3,
	hideLineNumbers: false,
	showDiffOnly: true,
	highlightLines: [],
	// styles prop removed
	useDarkTheme: false,
};

export default DiffViewer;
export { DiffMethod }; // Keep DiffMethod export
