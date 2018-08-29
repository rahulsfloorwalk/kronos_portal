import React from "react";

import Label from "./Label.jsx";
import { getAuditApplicationStatus } from "../utils.js";

export default class ApplicationStatusLabel extends React.Component {
    getLabelType = (status) => {
    	switch(this.props.status){
    	case "APPLIED":
    		return "primary";
    	case "NOT_APPLIED":
    		return "default";
    	case "WAITLISTED":
    		return "warning";
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
    };

    render() {
    	return (
    		<Label type={this.getLabelType(this.props.status)}>{getAuditApplicationStatus(this.props.status)}</Label>
    	);
    }
}
