import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormInputError from './FormInputError.jsx';


var FormInput = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<input className="form-control" {...this.props}/>
				<FormInputError errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

export default FormInput;
