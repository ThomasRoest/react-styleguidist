import deabsDeep from 'deabsdeep';
import { vol } from 'memfs';
import getExamples from '../getExamples';

jest.mock('fs', () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	return require('memfs').fs;
});

const file = '../pizza.js';
const displayName = 'Pizza';
const examplesFile = './Pizza.md';

afterEach(() => {
	vol.reset();
});

test('require an example file if component has example file', () => {
	vol.fromJSON({ [examplesFile]: 'pizza' });

	const result = getExamples(file, displayName, examplesFile);
	expect(result && deabsDeep(result).require).toMatchInlineSnapshot(
		`"!!~/src/loaders/examples-loader.js?displayName=Pizza&file=.%2F..%2Fpizza.js!./Pizza.md"`
	);
});

test('return null if component has no example file', () => {
	const result = getExamples(file, displayName);
	expect(result).toEqual(null);
});
