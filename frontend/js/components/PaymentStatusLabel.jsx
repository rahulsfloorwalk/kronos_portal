import React from "react";

import Label from "./Label.jsx";
import { getPaymentStatus } from "../utils.js";

export default class PaymentStatusLabel extends React.Component {
    getLabelType = (status) => {
    	switch(this.props.status){
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
