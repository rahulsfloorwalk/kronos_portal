import React from "react";
import PropTypes from "prop-types";

export default class Jumbotron extends React.Component {
	static propTypes = {
		align: PropTypes.oneOf(["center", "left", "right"]),
		heading: PropTypes.string,
		para: PropTypes.string,
		node: PropTypes.node
	};

	static defaultProps = {
		align: "center",
		heading: "",
		para: "",
		node: ""
	};

	render() {
		return (
			<div className="form-group">
				<div className={`jumbotron text-${this.props.align}`}>
					<h3>{this.props.heading}</h3>
					<p>{this.props.para}</p>
					{this.props.node ? this.props.node : null}
				</div>
			</div>
		);
	}
}
