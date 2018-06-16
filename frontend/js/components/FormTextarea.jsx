import React, { Component } from "react";
import PropTypes from "prop-types";

import FormGroup from "./FormGroup.jsx";
import FormErrorList from "./FormErrorList.jsx";


export default class FormTextarea extends Component {
	static propTypes = {
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		maxLength: PropTypes.number,
		name: PropTypes.string,
		disabled: PropTypes.bool,
		label: PropTypes.string,
		value: PropTypes.string,
		errors: PropTypes.arrayOf(PropTypes.string),
	};
	render(){
		const { placeholder, onChange, maxLength, value, name, disabled, label, errors } = this.props;
		return (
			<FormGroup>
				<label>{label}</label>
				<textarea className="form-control"
					placeholder={placeholder}
					onChange={onChange}
					maxLength={maxLength}
					value={value}
					name={name}
					disabled={disabled}
				/>
				<FormErrorList errors={errors}/>
			</FormGroup>
		);
	}
}

