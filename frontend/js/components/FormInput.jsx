import React from 'react';
import Datetime from 'react-datetime';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormInput = React.createClass({
	focus: function(){
		this._input && this._input.focus();
	},
	render : function(){
		let { placeholder, onChange, maxLength, type, value, name, disabled, label } = this.props;

		// convert all nulls and undefineds to an empty String so the component is always in a controlled state
		value = value ? value : "";
		return (
			<FormGroup>
				<label>{label}</label>
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
				/>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

var FormDateInput = React.createClass({
	render: function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
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
});

export default FormInput;
export { FormDateInput };
