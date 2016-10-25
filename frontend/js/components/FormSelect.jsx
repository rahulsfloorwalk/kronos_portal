import React from 'react';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormSelect = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<select className="form-control" {...this.props}>
					{this.props.children}
				</select>
				<FormErrorList errors={this.props.errors}/>
			</FormGroup>
		);
	},
});

export default FormSelect;
