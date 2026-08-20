import React from "react";
import PropTypes from  "prop-types";

export const labelStyles = [
	"default",
	"info",
	"primary",
	"primary1",
	"success",
	"success2",
	"success3",
	"warning",
	"warning2",
	"danger",
	"danger2",
];

export default class Label extends React.Component {
	static propTypes = {
		type: PropTypes.oneOf(labelStyles).isRequired,
		color: PropTypes.string,
		children: PropTypes.node,
	};

	static defaultProps = {
		type: "default",
	};

	// render() {
	// 	var labelStyle = {
	// 		fontSize: "100%"
	// 	};
	// 	return (
	// 		<span className={`label label-${this.props.type}`} style={labelStyle}>
	// 			{this.props.children}
	// 		</span>
	// 	);
	// }

	render() {
		var labelStyle = {
			fontSize: "100%",
			...(this.props.color ? { backgroundColor: this.props.color, borderColor: this.props.color } : {}),
		};
		return (
			<span className={`label label-${this.props.type}`} style={labelStyle}>
				{this.props.children}
			</span>
		);
	}
}
