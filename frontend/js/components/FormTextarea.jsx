import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormInputError from './FormInputError.jsx';


var FormTextarea = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<textarea className="form-control" {...this.props}/>
				<FormInputError errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

export default FormTextarea;
