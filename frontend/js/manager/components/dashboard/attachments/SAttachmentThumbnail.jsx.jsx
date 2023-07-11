import React, { Component } from "react";
import PropTypes from "prop-types";
import { truncateStyle, pointerStyle } from "../../../../styles.js";
import { Cross } from "../../../../components/Icons.jsx";
import AttachmentProofIcon from "../../../../components/AttachmentProofIcon.jsx";
import loadingImageUrl from "../../../../../img/ripple.svg";
import attachmentErrorImgUrl from "../../../../../img/error_100.png";
import attachmentMicrophoneImgUrl from "../../../../../img/microphone_100.png";
import attachmentFilmImgUrl from "../../../../../img/film_100.png";
import attachmentFileImgUrl from "../../../../../img/file_100.png";

export default class SAttachmentThumbnail extends Component{
	static propTypes = {
		attachment: PropTypes.shape({
			id: PropTypes.number.isRequired,
			proof_type: PropTypes.string.isRequired,
			direct_url: PropTypes.string.isRequired,
			file_name: PropTypes.string,
		}),
		selected: PropTypes.bool,
		deletable: PropTypes.bool,
		// editable:PropTypes.bool,
		onSelect: PropTypes.func,
		onDelete: PropTypes.func,
		onChange: PropTypes.func,
		section_id: PropTypes.oneOfType([PropTypes.string,PropTypes.number])
	};

	constructor(props){
		super(props);
		this.state = {
			hover: false,
			loading: false,
			error: false,
			display:"none",
		};
	}
	showModal = (e) => {
		e.stopPropagation();
		this.setState({ display:"block" });
	};

	hideModal = () => {
		this.setState({ display:"none" });
	};
	delete_hideModal = (e) => {
		e.stopPropagation();
		this.props.onDelete();
		this.setState({ display:"none" });
	};
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
		if(this.props.attachment){
			this.setLoading(true);
		}
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.attachment && nextProps.attachment.id !== this.props.attachment.id){
			if(nextProps.attachment){
				this.setLoading(true);
			}
		}
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

		const modalStyle = {
			display: this.state.display,
			overflow: "scroll"
		};
		const modalBackdropStyle = {
			zIndex: "1060",
			height: "100%"
		};
		const modalDialogStyle = {
			zIndex: "1070",
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
				<button className="btn btn-default btn-sm pull-right" onClick={this.showModal} title="Delete Attachment">
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
		divStyle.backgroundImage = `url("${imageSrc}")`;

		return (
			<div style={{display:"inline-block",width:"150px",height:"100px",margin: "5px",}}>
				<div style={divStyle} title={a.file_name} onClick={onSelect} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
					{deleteButton}
					<div style={fileNameStyle}>
						<AttachmentProofIcon proofType={a.proof_type}/>&nbsp;
						<a href={a.direct_url} style={anchorStyle}>{a.file_name}</a><br/>
					</div>
					<img className="hidden" src={imageSrc} onLoad={this.onImageLoad} onError={this.onImageError}/>

					<div className="modal" tabIndex="-1" style={modalStyle}>
						<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal}/>
						<div className="modal-dialog" style={modalDialogStyle}>
							<div className="modal-content">
								<div className="modal-header">
									<button type="button" className="close" onClick={this.hideModal}>&times;</button>
									<h4 className="modal-title">Delete Attachment</h4>
								</div>
								<div className="modal-body">
									Are you sure you want to delete <b>{this.props.attachment.file_name}</b> attachment ?
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-default" onClick={this.delete_hideModal}>Yes</button>
									<button type="button" className="btn btn-default" onClick={this.hideModal}>No</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}