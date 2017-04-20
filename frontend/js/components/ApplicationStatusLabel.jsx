import React from 'react';

import Label from './Label.jsx';
import { getAuditApplicationStatus } from '../utils.js';

export default React.createClass({
	getLabelType : function(status){
		switch(this.props.status){
			case "APPLIED":
				return "primary";
			case "NOT_APPLIED":
				return "default";
			case "APPROVED":
				return "success";
			case "REJECTED":
				return "danger";
			case "":
			case null:
			case undefined:
				return "";
			default:
				return `unknown status type ${this.props.status} - ${typeof this.props.status}`;
		}
	},
	render : function(){
		return (
			<Label type={this.getLabelType(this.props.status)}>{getAuditApplicationStatus(this.props.status)}</Label>
		);
	},
});
