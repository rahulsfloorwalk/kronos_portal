import React from "react";
import PropTypes from "prop-types";

export default class SaveButton extends React.Component{
	static propTypes = {
		text: PropTypes.string,
		disabled: PropTypes.bool,
	};

	render(){
		let text = this.props.text || "Save";
		return (
			<button type="submit"
				className="btn btn-primary"
				disabled={this.props.disabled}>
				{text}
			</button>
		);
	}
}
