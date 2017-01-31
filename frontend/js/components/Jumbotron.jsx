import React from 'react';

export default React.createClass({
	getDefaultProps: function(){
		return {
			align: 'center',
			heading: '',
			para: ''
		};
	},
	render : function(){
		return (
			<div className="form-group">
			<div className={`jumbotron text-${this.props.align}`}>
				<h3>{this.props.heading}</h3>
				<p>{this.props.para}</p>
			</div>
			</div>
		);
	},
});
