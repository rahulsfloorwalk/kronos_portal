import React from 'react';

class Panel extends React.Component {
    render() {
		var type = this.props.type || "default";
		var panelClass = "panel panel-" + type;
		var noBody = this.props.noBody || false;

		if(noBody){
			return (
				<div className={panelClass}>
					<div className="panel-heading">
						<h3 className="panel-title">{this.props.title}</h3>
					</div>
					{this.props.children}
				</div>
			);
		} else {
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
		}
	}
}

export default Panel;
