import React from "react";
import PropTypes from "prop-types";

export default class LabelValue extends React.Component {
	static propTypes = {
		label: PropTypes.string,
		value: PropTypes.string,
	};
	render() {
		return (
			<div className="form-group">
				<div className="col-xs-4 text-right">{this.props.label}</div>
				<div className="col-xs-8"><b>{ this.props.value }</b></div>
			</div>
		);
	}
}

export class LabelValue_2_10 extends React.Component {
	static propTypes = {
		label: PropTypes.string,
		value: PropTypes.string,
	};
	render() {
		return (
			<div className="form-group">
				<div className="col-xs-3 text-right">{this.props.label}</div>
				<div className="col-xs-9"><b>{ this.props.value }</b></div>
			</div>
		);
	}
}
