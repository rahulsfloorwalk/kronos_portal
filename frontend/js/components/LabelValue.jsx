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

var LabelValue_2_10 = React.createClass({
	render : function(){
		return (
			<div className="form-group">
				<div className="col-xs-3 text-right">{this.props.label}</div>
				<div className="col-xs-9"><b>{ this.props.value }</b></div>
			</div>
		);
	},
});

export { LabelValue_2_10 };
export default LabelValue;
