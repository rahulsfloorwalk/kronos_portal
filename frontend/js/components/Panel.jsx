import React from 'react';

var Panel = React.createClass({
	render : function(){
		var type = this.props.type || "default";
		var panelClass = "panel panel-" + type;

		return (
			<div className={panelClass}>
				<div className="panel-heading">
					<h3 className="panel-title">{this.props.title}</h3>
				</div>
				<div className="panel-body">
					{this.props.children}
				</div>
			</div>
		);
	},
});

export default Panel;
