
import React from 'react';

export default React.createClass({
	getDefaultProps: function(){
		return {
			percentage: 0,
			type: "",
			active: false,
			striped: false
		};
	},
	render: function(){
		let typeClass = this.props.type ? `progress-bar-${this.props.type}` : "";
		let activeClass = this.props.active ? "active" : "";
		let stripedClass = this.props.striped ? "progress-bar-striped" : "";

		let widthStyle = {
			width: this.props.percentage + "%"
		};
		return (
			<div className="progress">
				<div className={`progress-bar ${typeClass} ${activeClass} ${stripedClass}`} role="progressbar" aria-valuenow={this.props.percentage} aria-valuemin="0" aria-valuemax="100" style={widthStyle}>
					<span className="sr-only">{this.props.percentage}% Complete</span>
				</div>
			</div>
		);
	},
});
