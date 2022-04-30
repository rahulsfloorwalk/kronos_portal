import React from "react";
import PropTypes from "prop-types";

import FormGroup from "./FormGroup.jsx";
import FormErrorList from "./FormErrorList.jsx";


export default class QuestionnaireTypeFormSelect extends React.Component{
	static propTypes = {
		onChange: PropTypes.func,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]),
		placeholder: PropTypes.string,
		name: PropTypes.string,
		disabled: PropTypes.bool,
		label: PropTypes.string,
		errors: PropTypes.array,
		required: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.bool,
		]),
	};

	render(){
		const { placeholder, onChange, name, disabled, label, required } = this.props;

		// convert all nulls and undefineds to an empty String so the component is always in a controlled state
		const value = (this.props.value === null || this.props.value === undefined) ? "" : this.props.value;
		return (
			<FormGroup>
				<label>{this.props.label}{this.props.required ? <span className="text-danger">*</span> : null }</label>
				<select className="form-control"
					placeholder={placeholder}
					onChange={onChange}
					value={value}
					name={name}
					disabled={disabled}
					label={label}
					required={required}
				>
					<option></option>
					<option value="Walkin">Walkin</option>
					<option value="Telephonic">Telephonic</option>
					<option value="Web Audit">Web Audit</option>
				</select>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	}
}
