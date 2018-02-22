import React from "react";
import PropTypes from "prop-types";

export default class SaveButton extends React.Component{
	static propTypes = {
		text: PropTypes.string,
	};

	render(){
		let text = this.props.text || "Save";
		return (
			<button type="submit" className="btn btn-primary">
				{text}
			</button>
		);
	}
}
