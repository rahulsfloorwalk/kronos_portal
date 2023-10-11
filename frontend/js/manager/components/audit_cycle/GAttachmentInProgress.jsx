import React, { Component } from "react";
import PropTypes from "prop-types";
import { truncateStyle, pointerStyle } from "../../../styles.js";

export default class CAttachmentInProgress extends Component{
	static propTypes = {
		error: PropTypes.any,
		progress: PropTypes.number,
		fileName: PropTypes.string,
		uploadMessage: PropTypes.string,
	};

	render(){
		const error = !!this.props.error;
		const fileName = this.props.fileName || "uploading...";
		const myProgress = this.props.progress ? this.props.progress + "%" : this.props.progress;
		const displayMessage = this.props.uploadMessage || myProgress || "in progress";

		const divStyle= Object.assign({}, pointerStyle, {
			display: "inline-block",
			position: "relative",
			width: "150px",
			height: "100px",
			border: error ? "solid #EBCCD1 1px" : "solid LightGray 1px",
			borderRadius: "3px",
			backgroundColor: "LightGray",
			margin: "5px",
		});

		const fileNameStyle=Object.assign({}, truncateStyle, {
			color: error ? "#A94442" : "Black",
			backgroundColor: error ? "rgb(242,222,222)" : "rgb(255,255,255)",
			width: "100%",
			position: "absolute",
			bottom: "0px",
			padding: "2px",
			paddingLeft: "5px",
			borderBottomLeftRadius: "3px",
			borderBottomRightRadius: "3px",
		});

		const displayDivStyle = {
			position:"absolute",
			top:"0px",
			left:"0px",
			textAlign: "center",
			width:"100%",
			height:"100%",
			fontSize: "1.2em",
		};

		return (
			<div style={divStyle} title={fileName}>
				<div style={displayDivStyle}>
					<br/>
					{displayMessage}
				</div>
				<div style={fileNameStyle}>
					{fileName}
				</div>
			</div>
		);
	}
}

