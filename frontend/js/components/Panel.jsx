import React from "react";
import PropTypes from "prop-types";

class Panel extends React.Component {
	static propTypes = {
		type: PropTypes.string,
		noBody: PropTypes.bool,
		title: PropTypes.string,
		children: PropTypes.node,
	};
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
