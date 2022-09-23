import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PlaygroundError from 'rsg-components/PlaygroundError';
import ReactExample from 'rsg-components/ReactExample';
import Context, { StyleGuideContextContents } from 'rsg-components/Context';
import { createRoot, Root } from 'react-dom/client';

const improveErrorMessage = (message: string) =>
	message.replace(
		'Check the render method of `StateHolder`.',
		'Check the code of your example in a Markdown file or in the editor below.'
	);

interface PreviewProps {
	code: string;
	evalInContext(code: string): () => any;
}

interface PreviewState {
	error: string | null;
}

export default class Preview extends Component<PreviewProps, PreviewState> {
	public static propTypes = {
		code: PropTypes.string.isRequired,
		evalInContext: PropTypes.func.isRequired,
	};
	public static contextType = Context;

	private root: Root | null = null;

	public state: PreviewState = {
		error: null,
	};

	public componentDidMount() {
		// Clear console after hot reload, do not clear on the first load
		// to keep any warnings
		if ((this.context as StyleGuideContextContents).codeRevision > 0) {
			// eslint-disable-next-line no-console
			console.clear();
		}

		this.executeCode();
	}

	public shouldComponentUpdate(nextProps: PreviewProps, nextState: PreviewState) {
		return this.state.error !== nextState.error || this.props.code !== nextProps.code;
	}

	public componentDidUpdate(prevProps: PreviewProps) {
		if (this.props.code !== prevProps.code) {
			this.executeCode();
		}
	}

	public componentWillUnmount() {
		this.unmountPreview();
	}

	public unmountPreview() {
		if (this.root) {
			this.root.unmount();
		}
	}

	private executeCode() {
		this.setState({
			error: null,
		});

		const { code } = this.props;
		if (!code) {
			return;
		}

		const wrappedComponent: React.FunctionComponentElement<any> = (
			<ReactExample
				code={code}
				evalInContext={this.props.evalInContext}
				onError={this.handleError}
				compilerConfig={(this.context as StyleGuideContextContents).config.compilerConfig}
			/>
		);

		window.requestAnimationFrame(() => {
			// this.unmountPreview();
			try {
				if (this.root) {
					this.root.render(wrappedComponent);
				}
			} catch (err) {
				/* istanbul ignore next: it is near-impossible to trigger a sync error from ReactDOM.render */
				if (err instanceof Error) {
					/* istanbul ignore next */
					this.handleError(err);
				}
			}
		});
	}

	private handleError = (err: Error) => {
		this.unmountPreview();

		this.setState({
			error: improveErrorMessage(err.toString()),
		});

		console.error(err); // eslint-disable-line no-console
	};

	private createReactRoot(ref: HTMLDivElement | null) {
		if (ref && !this.root) {
			this.root = createRoot(ref);
		}
	}

	public render() {
		const { error } = this.state;
		return (
			<>
				<div data-testid="mountNode" ref={(ref) => this.createReactRoot(ref)} />
				{error && <PlaygroundError message={error} />}
			</>
		);
	}
}
