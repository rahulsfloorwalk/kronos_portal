import React from 'react';

import { Globe, PhoneAlt, EyeOpen, Briefcase, Road } from './Icons.jsx';

import { getAuditType } from '../utils.js';

export default React.createClass({
	getIcon : function(type){
		switch(type){
			case "WALKIN":
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
				return "";
		}
	},
	render : function(){
		let at = getAuditType(this.props.auditType);
		return (<span>{this.getIcon(this.props.auditType)} {at}</span>);
	},
});
