import React from "react";
import PropTypes from "prop-types";

import FormGroup from "./FormGroup.jsx";
import FormErrorList from "./FormErrorList.jsx";


export default class FormSelect extends React.Component{
	static propTypes = {
		placeholder: PropTypes.string,
		onChange: PropTypes.func,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]),
		name: PropTypes.string,
		disabled: PropTypes.bool,
		label: PropTypes.string,
		errors: PropTypes.array,
		children: PropTypes.array,
		required_mark: PropTypes.bool,
	};

	render(){
		const { placeholder, onChange, name, disabled, label } = this.props;

		// convert all nulls and undefineds to an empty String so the component is always in a controlled state
		const value = (this.props.value === null || this.props.value === undefined) ? "" : this.props.value;
		return (
			<FormGroup>
				{this.props.required_mark ?
					<label>
						{this.props.label} <span className="text-danger">(✳)</span>
					</label>
					:
					<label>{this.props.label}</label>
				}
				<select className="form-control"
					placeholder={placeholder}
					onChange={onChange}
					value={value}
					name={name}
					disabled={disabled}
					label={label}
				>
					{this.props.children}
				</select>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	}
}
