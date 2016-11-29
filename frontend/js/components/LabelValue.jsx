import React from 'react';

var LabelValue = React.createClass({
	render : function(){
		return (
			<div className="form-group">
				<div className="col-xs-4 text-right">{this.props.label}</div>
				<div className="col-xs-8"><b>{ this.props.value }</b></div>
			</div>
		);
	},
});

export default LabelValue;
