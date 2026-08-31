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
		case "SYSTEM_ASSIGNED":
			return "success";
		case "MANUAL_ASSIGNED":
			return "success2";
		case "INSTANT_ASSIGNED":
			return "success3";
		case "OPEN":
			return "primary1";
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

	getLabelColor = (status) => {
		switch (status) {
		case "OPEN":
			return "#8b0000";
		case "SYSTEM_ASSIGNED":
			return "#77acd9";
		case "INSTANT_ASSIGNED":
			return "#2a7a2a";
		case "MANUAL_ASSIGNED":
			return "#c77c11";
		default:
			return undefined;
		}
	};
	render() {
		return (
			// <Label type={this.getLabelType(this.props.status)}>{getAuditApplicationStatus(this.props.status)}</Label>
			<Label type={this.getLabelType(this.props.status) === "success3" ? "success" : this.getLabelType(this.props.status)} color={this.getLabelColor(this.props.status)}>
				{getAuditApplicationStatus(this.props.status)}
			</Label>
		);
	}
}
