import React from "react";
import PropTypes from "prop-types";

import { ApplicationStatus } from "../constants.js";
import Label from "./Label.jsx";
import { getAuditApplicationStatus } from "../utils.js";

export default class ApplicationStatusLabel extends React.Component {
	static propTypes = {
		status: PropTypes.oneOf(ApplicationStatus),
	};

	getLabelType = (status) => {
		switch(status){
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
		case "WITHDRAWN":
			return "default";
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
