import React from "react";
import PropTypes from "prop-types";

const errorItemStyle = {
	"color": "red",
};

export default class FormErrorList extends React.Component{
	static propTypes = {
		errors: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	static defaultProps = {
		errors: [],
	};

	render(){
		const items = this.props.errors.map((e) => <li key={e} style={errorItemStyle}><b>{e}</b></li>);
		return (
			<ul>
				{items}
			</ul>
		);
	}
}
