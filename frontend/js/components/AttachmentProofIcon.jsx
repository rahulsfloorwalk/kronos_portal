import React from "react";
import PropTypes from "prop-types";

import { Record, Picture, Video, File } from "./Icons.jsx";
import { AttachmentProofType } from "../constants.js";

export default class AttachmentProofIcon extends React.Component {
	static propTypes = {
		proofType: PropTypes.oneOf(AttachmentProofType),
	};
	static defaultProps = {
		proofType: "OTHER",
	};

	render() {
		switch(this.props.proofType){
		case "AUDIO":
			return <Record/>;
		case "PHOTO":
			return <Picture/>;
		case "VIDEO":
			return <Video/>;
		case "OTHER":
		default:
			return <File/>;
		}
	}
}
