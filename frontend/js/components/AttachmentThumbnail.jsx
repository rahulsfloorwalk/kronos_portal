import React, { Component } from "react";
import PropTypes from "prop-types";

import { truncateStyle, pointerStyle } from "../styles.js";

import { Cross } from "./Icons.jsx";

import AttachmentProofIcon from "./AttachmentProofIcon.jsx";

import loadingImageUrl from "../../img/ripple.svg";
import attachmentErrorImgUrl from "../../img/error_100.png";
import attachmentMicrophoneImgUrl from "../../img/microphone_100.png";
import attachmentFilmImgUrl from "../../img/film_100.png";
import attachmentFileImgUrl from "../../img/file_100.png";

export default class AttachmentThumbnail extends Component{
	static propTypes = {
		attachment: PropTypes.shape({
			id: PropTypes.number.isRequired,
			proof_type: PropTypes.string.isRequired,
		}),
		user: PropTypes.string,
		selected: PropTypes.bool,
		deletable: PropTypes.bool,

		onSelect: PropTypes.func,
		onDelete: PropTypes.func,
		
		editable:PropTypes.bool
	};
	
	constructor(props){
		super(props);
		this.state = {
			hover: false,
			loading: false,
			error: false,
		};
	}
	setHover = (hover) => {
		this.setState((prevState) => Object.assign({}, prevState, { hover }));
	};
	onMouseEnter = () => {
		this.setHover(true);
	};
	onMouseLeave = () => {
		this.setHover(false);
	};
	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};
	setError = (error) => {
		this.setState((prevState) => Object.assign({}, prevState, { error }));
	};
	onImageLoad = () => {
		this.setLoading(false);
	};
	onImageError = () => {
		this.setLoading(false);
		this.setError(true);
	};
	
	
	componentDidMount(){
		if(this.props.attachment && this.props.attachment.proof_type === "PHOTO"){
			this.setLoading(true);
		}
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.attachment && nextProps.attachment.id !== this.props.attachment.id){
			if(nextProps.attachment && nextProps.attachment.proof_type === "PHOTO"){
				this.setLoading(true);
			}
		}
	}
	render(){
		
		var contentStyle = {
			"width": "20px",
            "height": "20px",
		};
		
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
			if( this.state.loading){
				imageSrc = loadingImageUrl;
				divStyle.backgroundSize = "30px 30px";
			} else if( this.state.error) {
				imageSrc = attachmentErrorImgUrl;
				divStyle.backgroundSize = "30px 30px";
			} else {
				imageSrc = a.extra.thumbnail_url;
			}
			break;
		case "AUDIO":
			imageSrc = attachmentMicrophoneImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		case "VIDEO":
			imageSrc = attachmentFilmImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		case "OTHER":
			imageSrc = attachmentFileImgUrl;
			divStyle.backgroundSize = "30px 30px";
			break;
		}
		divStyle.backgroundImage = `url(${imageSrc})`;
		
		let checkboxElement = null;
		if (this.props.user == "client" || this.props.user == "agency"){
			checkboxElement = null;
		}
		else{
			if(this.props.editable){
				checkboxElement = (<input type="checkbox" style={contentStyle} value={a.id}/>);
			}
		}
		
		return (
			<div style={divStyle} title={a.file_name} onClick={onSelect} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				{checkboxElement}
				{deleteButton}
				<div style={fileNameStyle}>
					<AttachmentProofIcon proofType={a.proof_type}/>&nbsp;
					<a href={a.direct_url} style={anchorStyle}>{a.file_name}</a>
				</div>
				<img className="hidden" src={imageSrc} onLoad={this.onImageLoad} onError={this.onImageError}/>
			</div>
		);
	}
}

