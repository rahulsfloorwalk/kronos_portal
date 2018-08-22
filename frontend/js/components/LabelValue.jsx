import React from "react";

class LabelValue extends React.Component {
	render() {
		return (
			<div className="form-group">
				<div className="col-xs-4 text-right">{this.props.label}</div>
				<div className="col-xs-8"><b>{ this.props.value }</b></div>
			</div>
		);
	}
}

class LabelValue_2_10 extends React.Component {
	render() {
		return (
			<div className="form-group">
				<div className="col-xs-3 text-right">{this.props.label}</div>
				<div className="col-xs-9"><b>{ this.props.value }</b></div>
			</div>
		);
	}
}

export { LabelValue_2_10 };
export default LabelValue;
