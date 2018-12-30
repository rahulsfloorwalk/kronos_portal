import React from "react";
import PropTypes from "prop-types";

import Label from "./Label.jsx";
import { getPaymentStatus } from "../utils.js";

export default class PaymentStatusLabel extends React.Component {
	static propTypes = {
		status: PropTypes.string,
	};
	getLabelType = (status) => {
		switch(status){
		case "PENDING":
			return "danger";
		case "FAILED":
			return "danger2";
		case "PAID":
			return "success";
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
			<Label type={this.getLabelType(this.props.status)}>{getPaymentStatus(this.props.status)}</Label>
		);
	}
}
