import React from "react";
import PropTypes from "prop-types";

import Label from "./Label.jsx";
import { getReferralType } from "../utils.js";

export default class ReferralTypeLabel extends React.Component {
	static propTypes = {
		type: PropTypes.string,
	};
	getLabelType = (type) => {
		switch(type){
		case "SIGNUP":
			return "warning";
		case "AUDIT":
			return "warning";
		case "PAID":
			return "success";
		case "":
		case null:
		case undefined:
			return "";
		default:
			return `unknown type ${this.props.type} - ${typeof this.props.type}`;
		}
	};

	render() {
		return (
			<Label type={this.getLabelType(this.props.type)}>{getReferralType(this.props.type)}</Label>
		);
	}
}
