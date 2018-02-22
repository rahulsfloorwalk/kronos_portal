import React from "react";
import PropTypes from "prop-types";

export default class FormErrorList extends React.Component{
	static propTypes = {
		errors: PropTypes.array.isRequired,
	};

	static defaultProps = {
		errors: [],
	};

	render(){
		let items = [];
		for( let error of this.props.errors){
			items.push(<li key={error} style={{"color": "red"}}><b>{error}</b></li>);
		}
		return (
			<ul>
				{items}
			</ul>
		);
	}
}
