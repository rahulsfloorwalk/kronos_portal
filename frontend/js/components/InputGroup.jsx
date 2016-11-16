import React from 'react';
import Datetime from 'react-datetime';

var InputGroup = React.createClass({
	render : function(){
		return (
			<div className="input-group">
				{this.props.children}
			</div>
		);
	},
});

var InputGroupBtn = React.createClass({
	render : function(){
		return (
			<span className="input-group-btn">
				{this.props.children}
			</span>
		);
	},
});

export default InputGroup;
export { InputGroupBtn };
