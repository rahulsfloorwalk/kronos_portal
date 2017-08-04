import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { truncateStyle, pointerStyle } from '../styles.js';

import { Plus, Cross, Pencil, Paperclip } from './Icons.jsx';

import AttachmentProofIcon from './AttachmentProofIcon.jsx';

export default class AttachmentInProgressThumbnail extends Component{
	constructor(props){
		super(props);
	}
	render(){
		let fileName = this.props.fileName || "uploading...";
		let myProgress = this.props.progress ? this.props.progress + "%" : this.props.progress;
		let displayMessage = this.props.uploadMessage || myProgress || "in progress";

		let divStyle= Object.assign({}, pointerStyle, {
			display: "inline-block",
			position: "relative",
			width: "150px",
			height: "100px",
			border: "solid LightGray 1px",
			borderRadius: "3px",
			backgroundColor: "LightGray",
			margin: "5px",
		});

		let fileNameStyle=Object.assign({}, truncateStyle, {
			color: "Black",
			backgroundColor: "rgba(255,255,255,0.8)",
			width: "100%",
			position: "absolute",
			bottom: "0px",
			padding: "2px",
			paddingLeft: "5px",
			borderBottomLeftRadius: "3px",
			borderBottomRightRadius: "3px",
		});

		let displayDivStyle = {
			position:'absolute',
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

