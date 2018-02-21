import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormSelect = React.createClass({
	render : function(){
		let { placeholder, onChange, maxLength, type, value, name, disabled, label } = this.props;

		// convert all nulls and undefineds to an empty String so the component is always in a controlled state
		value = value ? value : "";
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<select className="form-control"
					placeholder={placeholder}
					onChange={onChange}
					maxLength={maxLength}
					type={type}
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
	},
});

export default FormSelect;
