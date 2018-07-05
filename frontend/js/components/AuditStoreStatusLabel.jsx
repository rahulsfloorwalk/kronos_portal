import React from "react";
import PropTypes from "prop-types";

import Label from "./Label.jsx";
import { getAuditStoreStatus } from "../utils.js";

import { AuditStoreStatus } from "../constants.js";

export default class AuditStoreStatusLabel extends React.Component {
	static propTypes = {
		status: PropTypes.oneOf(AuditStoreStatus),
	};

	getLabelType = (status) => {
		switch(status){
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
			return `unknown status type ${status} - ${typeof status}`;
		}
	};

	render() {
		return (
			<Label type={this.getLabelType(this.props.status)}>{getAuditStoreStatus(this.props.status)}</Label>
		);
	}
}
