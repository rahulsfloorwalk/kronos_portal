import React from "react";
import PropTypes from "prop-types";

import { Globe, PhoneAlt, EyeOpen, Briefcase, Road, Flag, Asterisk } from "./Icons.jsx";

import { getAuditType } from "../utils.js";
import { AuditType } from "../constants.js";

const AuditTypeIcon = (props) => {
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
	case "GENERAL":
		return (<Asterisk/>);
	case "":
	case null:
	case undefined:
	default:
		return (<Flag/>);
	}
};

export default class AuditTypeLabel extends React.Component {
	static propTypes = {
		auditType: PropTypes.oneOf(AuditType),
	};

	render() {
		let at = getAuditType(this.props.auditType);
		return (<span><AuditTypeIcon type={this.props.auditType}/> {at}</span>);
	}
}

export { AuditTypeIcon };
