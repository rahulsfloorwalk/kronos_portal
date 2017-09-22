import React from 'react';
import Datetime from 'react-datetime';

import FormGroup from './FormGroup.jsx';
import FormErrorList from './FormErrorList.jsx';


var FormInput = React.createClass({
	focus: function(){
		this._input && this._input.focus();
	},
	render : function(){
		return (
			<FormGroup>
				<label>{this.props.label}</label>
				<input className="form-control" ref={r => this._input = r} {...this.props}/>
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
