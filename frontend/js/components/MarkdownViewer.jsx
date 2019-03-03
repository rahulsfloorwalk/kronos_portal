import React from "react";
import PropTypes from "prop-types";
import promiseFinally from "promise.prototype.finally";
promiseFinally.shim();

import Loading from "./Loading.jsx";

export default class MarkdownViewer extends React.Component {
	static propTypes = {
		markdown: PropTypes.string,
	};

	static defaultProps = {
		markdown: "",
	};

	state = {
		loading: true
	};

	componentDidMount(){
		import("marked").then(({ default: marked }) => {
			this.marked = marked;
		}).catch((err) => {
			console.warn("COULD NOT LOAD MARKED:", err);
		}).finally(() => {
			this.setState({
				loading: false
			});
		});

	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		} else if(!this.marked) {
			return <div>there was a problem loading this preview</div>;
		} else {
			const markdown = {
				__html: this.marked(this.props.markdown),
			};
			return <div dangerouslySetInnerHTML={markdown } />;
		}
	}
}
