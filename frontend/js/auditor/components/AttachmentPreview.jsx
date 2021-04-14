import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../components/AttachmentProofIcon.jsx";
import Loading from "../../components/Loading.jsx";
// import InPlaceEditable from "../../components/InPlaceEditable.jsx";

import { DownloadAlt,  Cross } from "../../components/Icons.jsx";
import { attachmentPropType } from "../prop_types";

import attachmentErrorImageUrl from "../../../img/error_100.png";

import { Player, BigPlayButton  } from "video-react";

class AttachmentRenderer extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: true,
			error: false,
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	};
	setError = (error) => {
		this.setState((oldState) => Object.assign({}, oldState, { error }));
	};

	onLoad = () => {
		this.setLoading(false);
	};

	onError = () => {
		this.setError(true);
		this.setLoading(false);
	};

	componentDidMount(){
		if(this.props.attachment.proof_type === "PHOTO"){
			this.setLoading(true);
			this.setError(false);
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.attachment.proof_type === "PHOTO"){
			if(nextProps.attachment.id !== this.props.attachment.id){
				this.setLoading(true);
				this.setError(false);
			}
		}
		if(nextProps.attachment.proof_type === "AUDIO"){
			if(nextProps.attachment.proof_type === this.props.attachment.proof_type){
				const audio = this.audio_tag;
				const source = audio.querySelector("source");

				if(nextProps.attachment.id !== this.props.attachment.id){
					source.src = nextProps.attachment.direct_url;
					audio.load();
				}
			}
		}
		if(nextProps.attachment.proof_type === "VIDEO"){
			if(nextProps.attachment.proof_type === this.props.attachment.proof_type){
				if(nextProps.attachment.id !== this.props.attachment.id){
					this.player.load();
				}
			}
		}
	}

	render(){
		switch(this.props.attachment.proof_type){
		case "AUDIO": {
			return (
				<div>
					<p><b>Please download file if you are not able to play it.</b></p>
					<audio ref={node => this.audio_tag = node} controls>
						<source src={this.props.attachment.direct_url}
							type={this.props.attachment.mime_type}/>
					</audio>
				</div>
			);
		}
		case "PHOTO": {
			let loading, error;
			if( this.state.loading){
				loading = <Loading/>;
			}
			if( this.state.error){
				error = (<div className="text-center">
					<img src={attachmentErrorImageUrl}/>
					<p>cannot load image</p>
				</div>);
			}

			let imageStyle = {
				"display": this.state.loading ? "none" : "block",
				"maxWidth": "100%",
				"maxHeight": "500px",
				"margin": "auto",
			};
			return (<div style={{"textAlign": "center"}}>
				{loading}
				{error}
				<img src={this.props.attachment.extra.preview_url} style={imageStyle} onLoad={this.onLoad} onError={this.onError}/>
			</div>
			);
		}
		case "VIDEO":{
			return (
				// <video ref={node => this.video_tag = node} width="600" height="310" controls>
				// 	<source src={this.props.attachment.direct_url}
				// 		type={this.props.attachment.mime_type}/>
				// </video>
				<center>
					<p><b>Please download file if you are not able to play it.</b></p>
					<Player fluid={false} width={340} height={150} ref={node => this.player = node}>
						<BigPlayButton position="center" />
						<source src={this.props.attachment.direct_url} />
					</Player>
				</center>

			);
			// return (<p>Please download this file.</p>);
		}
		case "OTHER":
			return null;
		}
	}
}

export default class AttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
		onDelete: PropTypes.func,
		// onRename: PropTypes.func,
		proof_tags: PropTypes.array,
		onChange: PropTypes.func,
		section_id: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
		user: PropTypes.string
	};

	state = {
		display:"none"
	};

	showModal = () => {
		this.setState({ display:"block" });
	};

	hideModal = () => {
		this.setState({ display:"none" });
	};
	delete_hideModal = () => {
		this.props.onDelete();
		this.setState({ display:"none" });
	};
	render(){
		let proof_tag_select_box_style;

		if(!this.props.attachment){
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let deleteButton;
		let headingText;
		let proof_tag_select_box;
		let option_tag_list = [];

		if(this.props.user == "auditor"){
			for(let p of this.props.proof_tags){
				if(p.section_id === this.props.section_id){
					option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
				}
			}
		}
		else{
			for(let p of this.props.proof_tags){
				option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
			}
		}

		let proof_tag_select_box_value;
		if(this.props.attachment.proof_tag){
			proof_tag_select_box_value = this.props.attachment.proof_tag;
			proof_tag_select_box_style = {
				fontSize:"12px",
				width: "145px",
				height: "30px",
				marginRight:"1%",
				backgroundColor: "#DFF0D8",
			};
		}
		else{
			proof_tag_select_box_value = "";
			proof_tag_select_box_style = {
				fontSize:"12px",
				width: "145px",
				height: "30px",
				marginRight:"1%",
				backgroundColor: "#F2DEDE",
				border: "1px solid #ed0c0c",
			};
		}

		if(this.props.editable){
			deleteButton = (<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.showModal}><Cross/> Delete</button>);
			// headingText = (<InPlaceEditable inputText={this.props.attachment.file_name} onSave={this.props.onRename}>
			// 	{icon} {this.props.attachment.file_name}
			// </InPlaceEditable>);
			headingText = (<span>{icon} {this.props.attachment.file_name}</span>);
			if(option_tag_list.length > 0){
				proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} onChange={this.props.onChange} style={proof_tag_select_box_style}>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
		} else {
			headingText = (<span>{icon} {this.props.attachment.file_name}</span>);
			// if(option_tag_list.length > 0){
			// 	proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} style={proof_tag_select_box_style} disabled>
			// 		<option value="">Select Tag</option>
			// 		{option_tag_list}
			// 	</select>);
			// }
		}

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
		);

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

		return (
			<div>
				<h4 className="page-header">
					{deleteButton}
					{proof_tag_select_box}
					{headingText}
				</h4>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment}/>
					<br/>
					{downloadButton}
				</div>

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
		);
	}
}
