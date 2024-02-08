import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../components/AttachmentProofIcon.jsx";
import Loading from "../../components/Loading.jsx";

import { DownloadAlt,  Cross, Repeat, Plus, Minus } from "../../components/Icons.jsx";
import { attachmentPropType } from "../prop_types";

import Jumbotron from "../../components/Jumbotron.jsx";

import attachmentErrorImageUrl from "../../../img/error_100.png";

import { Player, BigPlayButton  } from "video-react";
import AmrAudioPlayer from "../../components/AmrAudioPlayer.jsx";

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

	zoomIn = () => {
		var imgProof = this.zoomImg;
		var currWidth = imgProof.clientWidth;
		if (currWidth == 2500){
			return false;
		}
		else {
			imgProof.style.width = (currWidth + 100) + "px";
		}
	};

	zoomOut = () => {
		var imgProof = this.zoomImg;
		var currWidth = imgProof.clientWidth;
		if (currWidth == 100){
			return false;
		}
		else {
			imgProof.style.width = (currWidth - 100) + "px";
		}
	};

	render(){

		let file_extension_arr = (this.props.attachment.file_slug).split(".");
		let file_extension = file_extension_arr[file_extension_arr.length - 1];
		switch(this.props.attachment.proof_type){
		case "AUDIO": {
			let audio_player_node;
			let audio_transcipt_table_data;
			let audio_transcipt_rows = [];
			const audio_transcript_data = (this.props.attachment.audio_transcript_data).hasOwnProperty("transcript_list") ? this.props.attachment.audio_transcript_data["transcript_list"] : [];
			let count_key = 1;
			for(let tl of audio_transcript_data){
				audio_transcipt_rows.push(
					<tr key={count_key}>
						<td>{tl.transcript_data}</td>
						<td>{tl.end_time}</td>
					</tr>
				);
				count_key += 1;
			}
			if (audio_transcipt_rows.length > 0){
				audio_transcipt_table_data = (
					<table className="table table-bordered">
						<thead>
							<tr>
								<th>Transcript data</th>
								<th>End Time</th>
							</tr>
						</thead>
						<tbody>
							{audio_transcipt_rows}
						</tbody>
					</table>
				);
			}
			else{
				audio_transcipt_table_data = (<Jumbotron heading="Not found" para="Audio transcription not available for this attachment"/>);
			}
			if(this.props.attachment.mime_type == "audio/AMR" || this.props.attachment.mime_type == "audio/amr"){
				audio_player_node = <AmrAudioPlayer audioRef={node => this.audio_tag = node} attachment={this.props.attachment} />;
			}
			else{
				audio_player_node = (<audio ref={node => this.audio_tag = node} controls>
					<source src={this.props.attachment.direct_url}
						type={this.props.attachment.mime_type}/>
				</audio>);
			}
			return (
				<div>
					<p><b>Please download file if you are not able to play it.</b></p>
					{audio_player_node}
					<div style={{overflowY:"auto", maxHeight:"400px"}}>
						{audio_transcipt_table_data}
					</div>
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
				"margin": "auto",
			};
			return (<div>
				{loading}
				{error}
				<button type="button" className="btn btn-sm btn-default" onClick={this.zoomIn}><Plus/> Zoom In</button>
				&nbsp;&nbsp;&nbsp;
				<button type="button" className="btn btn-sm btn-default" onClick={this.zoomOut}><Minus/> Zoom Out</button>
				<div className="zoom-div">
					<img ref={node => this.zoomImg = node} style={imageStyle} className="zoom-img" src={this.props.attachment.extra.preview_url} onLoad={this.onLoad} onError={this.onError} />
				</div>
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
					<Player fluid={false} width={600} height={350} ref={node => this.player = node}>
						<BigPlayButton position="center" />
						<source src={this.props.attachment.direct_url} />
					</Player>
				</center>

			);
			// return (<p>Please download this file.</p>);
		}
		case "OTHER":
			if (file_extension == "amr"){
				let audio_transcipt_table_data;
				let audio_transcipt_rows = [];
				const audio_transcript_data = (this.props.attachment.audio_transcript_data).hasOwnProperty("transcript_list") ? this.props.attachment.audio_transcript_data["transcript_list"] : [];
				let count_key = 1;
				for(let tl of audio_transcript_data){
					audio_transcipt_rows.push(
						<tr key={count_key}>
							<td>{tl.transcript_data}</td>
							<td>{tl.end_time}</td>
						</tr>
					);
					count_key += 1;
				}
				if (audio_transcipt_rows.length > 0){
					audio_transcipt_table_data = (
						<table className="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Transcript data</th>
									<th>End Time</th>
								</tr>
							</thead>
							<tbody>
								{audio_transcipt_rows}
							</tbody>
						</table>
					);
				}
				else{
					audio_transcipt_table_data = (<Jumbotron heading="Not found" para="Audio transcription not available for this attachment"/>);
				}
				return (
					<div style={{overflowY:"auto", maxHeight:"400px"}}>
						<p><b>.amr audio file does not support on browser, so you have to download the file.</b></p>
						{audio_transcipt_table_data}
					</div>
				);
			}
			else{
				return null;
			}
		}
	}
}

export default class AttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
		onDelete: PropTypes.func,
		onRename: PropTypes.func,
		proof_tags: PropTypes.array,
		onChange: PropTypes.func,
		rotateImage: PropTypes.func,
		disableRotateButton: PropTypes.bool
	};

	state = {
		display:"none",
		rotateButtonDisabled: false
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
		let rotateLeftButton;
		let rotateRightButton;
		let headingText;
		let proof_tag_select_box;
		let option_tag_list = [];

		for(let p of this.props.proof_tags){
			option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag}</option>);
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
			if (this.props.attachment.proof_type === "PHOTO"){
				rotateLeftButton = (
					<button type="button" className="btn btn-default" onClick={() => this.props.rotateImage("left")} disabled={this.props.disableRotateButton}>
						<Repeat/> Rotate Left
					</button>
				);
				rotateRightButton = (
					<button type="button" className="btn btn-default" onClick={()=> this.props.rotateImage("right")} disabled={this.props.disableRotateButton}>
						<Repeat/> Rotate Right
					</button>
				);
			}
			// headingText = (<InPlaceEditable inputText={this.props.attachment.file_name} onSave={this.props.onRename}>
			// 	{icon} {this.props.attachment.file_name}
			// </InPlaceEditable>);     //comment all for rename prooftag not editable
			headingText = <span>{icon} {this.props.attachment.file_name}</span>;   //new line add for rename not editable

			if(option_tag_list.length > 0){
				proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} onChange={this.props.onChange} style={proof_tag_select_box_style}>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
		} else {
			headingText = (<span>{icon} {this.props.attachment.file_name}</span>);
			if(option_tag_list.length > 0){
				proof_tag_select_box = (<select className="form-control form-control-sm pull-right" value={proof_tag_select_box_value} style={proof_tag_select_box_style} disabled>
					<option value="">Select Tag</option>
					{option_tag_list}
				</select>);
			}
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
					{rotateLeftButton}
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					{downloadButton}
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					{rotateRightButton}
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
