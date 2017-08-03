import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { truncateStyle, pointerStyle } from '../styles.js';

import { Plus, Cross, Pencil, Paperclip } from './Icons.jsx';

import AttachmentProofIcon from './AttachmentProofIcon.jsx';

export default class AttachmentThumbnail extends Component{
	constructor(props){
		super(props);
		this.state = {
			hover: false,
		};
	}
	setHover = (hover) => {
		this.setState( (prevState) => {
			return Object.assign({}, prevState, {
				hover
			});
		});
	}
	onMouseEnter = (e) => {
		this.setHover(true);
	}
	onMouseLeave = (e) => {
		this.setHover(false);
	}
	render(){
		let selected = this.props.selected || false;
		let onSelect = this.props.onSelect || (() => {});
		let selectable = !!this.props.onSelect;
		let a = this.props.attachment;


		let divStyle= Object.assign({}, pointerStyle, {
			display: "inline-block",
			width: "150px",
			height: "100px",
			backgroundPosition: "center center",
			backgroundRepeat: "no-repeat",
			position: "relative",
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

		let anchorStyle = {
			color:"Black",
		};

		if(selectable && (this.state.hover || selected)){
			divStyle.border = "solid #337AB7 2px";
		}
		if(selected){
			fileNameStyle.backgroundColor = "rgba(51,122,183,0.8)";
			fileNameStyle.color = "White";
			anchorStyle.color = "White";
		}

		let deleteButton;
		if( this.props.deletable && this.props.onDelete){
			deleteButton = (
				<button className="btn btn-default btn-sm pull-right" onClick={this.props.onDelete} title="Delete Attachment">
					<Cross/>
				</button>
			);
		}

		let imageSrc;
		switch(a.proof_type){
			case "PHOTO":
				imageSrc = a.extra.thumbnail_url;
				break;
			case "AUDIO":
				imageSrc = "/static/img/microphone_100.png";
				divStyle.backgroundSize = "30px 30px";
				break;
			case "VIDEO":
				imageSrc = "/static/img/film_100.png";
				divStyle.backgroundSize = "30px 30px";
				break;
			case "OTHER":
				imageSrc = "/static/img/file_100.png";
				divStyle.backgroundSize = "30px 30px";
				break;
		}
		divStyle.backgroundImage = `url(${imageSrc})`;
		return (
			<div style={divStyle} title={a.file_name} onClick={onSelect} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				{deleteButton}
				<div style={fileNameStyle}>
					<AttachmentProofIcon proofType={a.proof_type}/>&nbsp;
					<a href={a.direct_url} style={anchorStyle}>{a.file_name}</a>
				</div>
			</div>
		);
	}
}

