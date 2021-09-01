import React from "react";
import PropTypes from "prop-types";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import FormGroup from "./FormGroup.jsx";
import FormErrorList from "./FormErrorList.jsx";


export default class FormInput extends React.Component{
	static propTypes = {
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		maxLength: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]),
		type: PropTypes.string,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]),
		name: PropTypes.string,
		disabled: PropTypes.bool,
		label: PropTypes.string,
		errors: PropTypes.array,
		checked: PropTypes.bool,
		required_mark: PropTypes.bool,
	};

	focus(){
		this._input && this._input.focus();
	}
	render(){
		let { placeholder, onChange, maxLength, type, value, name, disabled, label, checked, required_mark } = this.props;

		// convert all nulls and undefineds to an empty String so the component is always in a controlled state
		value = value ? value : "";
		return (
			<FormGroup>
				{required_mark ?
					<label>
						{label} <span className="text-danger">(✳)</span>
					</label>
					:
					<label>{label}</label>
				}
				<input className="form-control"
					ref={r => this._input = r}
					placeholder={placeholder}
					onChange={onChange}
					maxLength={maxLength}
					type={type}
					value={value}
					name={name}
					disabled={disabled}
					label={label}
					checked={checked}
				/>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	}
}

export class FormDateInput extends React.Component{
	static propTypes = {
		label: PropTypes.string,
		errors: PropTypes.array,
		required_mark: PropTypes.bool,
	};

	render(){
		return (
			<FormGroup>
				{this.props.required_mark ?
					<label>
						{this.props.label} <span className="text-danger">(✳)</span>
					</label>
					:
					<label>{this.props.label}</label>
				}
				<Datetime
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}
					{...this.props}
				/>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	}
}

