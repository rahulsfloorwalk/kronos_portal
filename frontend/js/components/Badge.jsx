import React from "react";

export default class Badge extends React.Component {
	render() {
		return (
			<span className="badge">{this.props.children}</span>
		);
	}
}
