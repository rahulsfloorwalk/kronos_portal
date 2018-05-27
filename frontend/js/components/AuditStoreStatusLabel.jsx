import React from 'react';

import Label from './Label.jsx';
import { getAuditStoreStatus } from '../utils.js';

export default React.createClass({
	getLabelType : function(status){
		switch(this.props.status){
			case "ASSIGNED":
				return "warning";
			case "ACKNOWLEDGED":
				return "warning2";
			case "SUBMITTED":
				return "primary1";
			case "PM_REVIEW":
				return "primary";
			case "COMPLETED":
				return "success";
			case "ACCEPTED":
				return "success2";
			case "FAILED":
				return "danger";
			case "REJECTED":
				return "danger2";
			case "WITHDRAWN":
				return "default";
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
			<Label type={this.getLabelType(this.props.status)}>{getAuditStoreStatus(this.props.status)}</Label>
		);
	},
});
