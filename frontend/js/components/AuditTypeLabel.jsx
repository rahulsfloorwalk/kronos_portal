import React, { Component } from 'react';

import { Globe, PhoneAlt, EyeOpen, Briefcase, Road, Flag } from './Icons.jsx';

import { getAuditType } from '../utils.js';

let AuditTypeIcon = (props) => {
	switch(props.type){
		case "WALKIN":
		case "SALES":
		case "SERVICE":
			return (<Road/>);
		case "PHONE":
			return (<PhoneAlt/>);
		case "WEB":
			return (<Globe/>);
		case "VISIBILITY":
			return (<EyeOpen/>);
		case "COMPETITION":
			return (<Briefcase/>);
		case "":
		case null:
		case undefined:
		default:
			return (<Flag/>);
	}
};

export default React.createClass({
	render : function(){
		let at = getAuditType(this.props.auditType);
		return (<span><AuditTypeIcon type={this.props.auditType}/> {at}</span>);
	},
});

export { AuditTypeIcon };
