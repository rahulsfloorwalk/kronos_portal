import React from "react";
import PropTypes from "prop-types";

import { Check, Unchecked } from "./Icons.jsx";

export default class Checkbox extends React.Component{

	static propTypes = {
		checked: PropTypes.bool.isRequired,
		onChange: PropTypes.func.isRequired,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		checked: false,
		onChange: () => {},
		disabled: false,
	};

	constructor(props){
		super(props);
	}

	onClick = () => {
		this.props.onChange(!this.props.checked);
	};

	render(){
		let icon = this.props.checked ? <Check/> : <Unchecked/>;
		let btnClass = this.props.checked ? "btn-primary" : "btn-default";
		if(!this.props.disabled) {
			return (
				<button className={"btn " + btnClass} onClick={this.onClick} disabled={this.props.disabled}>
					{icon}
				</button>
			);
		} else {
			return icon;
		}
	}
}
