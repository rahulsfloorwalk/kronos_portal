import React from 'react';

import Label from './Label.jsx';
import { getAuditStoreStatus } from '../utils.js';

export default React.createClass({
	getLabelType : function(status){
		switch(this.props.status){
			case "ASSIGNED":
				return "warning";
			case "SUBMITTED":
				return "primary";
			case "COMPLETED":
				return "success";
			case "FAILED":
				return "danger";
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
