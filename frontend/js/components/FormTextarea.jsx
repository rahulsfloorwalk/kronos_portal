import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormTextarea = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<textarea className="form-control" {...this.props}/>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

export default FormTextarea;
