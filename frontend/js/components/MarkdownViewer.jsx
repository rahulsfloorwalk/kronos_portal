import React from "react";
import PropTypes from "prop-types";

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
		import("marked").then((marked) => {
			this.marked = marked;
			this.setState({
				loading: false
			});
		}).catch((err) => console.warn("COULD NOT LOAD MARKED:", err));

	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		} else {
			const markdown = {
				__html: this.marked(this.props.markdown),
			};
			return <div dangerouslySetInnerHTML={markdown } />;
		}
	}
}
