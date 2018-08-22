import React from "react";

import Label from "./Label.jsx";
import { getReferralType } from "../utils.js";

export default class extends React.Component {
    getLabelType = (type) => {
    	switch(this.props.type){
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
