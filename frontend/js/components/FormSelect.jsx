import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormInputError from './FormInputError.jsx';


var FormSelect = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<select className="form-control" {...this.props}>
					{this.props.children}
				</select>
				<FormInputError errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

export default FormSelect;
