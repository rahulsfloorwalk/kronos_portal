import React from 'react';
import Datetime from 'react-datetime';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormInput = React.createClass({
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<input className="form-control" {...this.props}/>
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
