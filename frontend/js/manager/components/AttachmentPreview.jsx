import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../components/AttachmentProofIcon.jsx";
import Loading from "../../components/Loading.jsx";
import InPlaceEditable from "../../components/InPlaceEditable.jsx";

import { DownloadAlt,  Cross } from "../../components/Icons.jsx";
import { attachmentPropType } from "../prop_types";

import attachmentErrorImageUrl from "../../../img/error_100.png";

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
				if (this.props.attachment.mime_type == "video/mp4"){
					const video = this.video_tag;
					const source = video.querySelector("source");

					if(nextProps.attachment.id !== this.props.attachment.id){
						source.src = nextProps.attachment.direct_url;
						video.load();
					}
				}
			}
		}
	}

	render(){
		switch(this.props.attachment.proof_type){
		case "AUDIO": {
			return (
				<audio ref={node => this.audio_tag = node} controls>
					<source src={this.props.attachment.direct_url}
						type={this.props.attachment.mime_type}/>
				</audio>
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
			if (this.props.attachment.mime_type == "video/mp4"){
				return (
					<video ref={node => this.video_tag = node} width="600" height="310" controls>
						<source src={this.props.attachment.direct_url}
							type={this.props.attachment.mime_type}/>
					</video>
				);
			}
			return (<p>Please download this file.</p>);
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
		onRename: PropTypes.func,
	};

	render(){
		if(!this.props.attachment){
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let deleteButton;
		let headingText;

		if(this.props.editable){
			deleteButton = (<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.props.onDelete}><Cross/> Delete</button>);
			headingText = (<InPlaceEditable inputText={this.props.attachment.file_name} onSave={this.props.onRename}>
				{icon} {this.props.attachment.file_name}
			</InPlaceEditable>);
		} else {
			headingText = (<span>{icon} {this.props.attachment.file_name}</span>);
		}

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
		);
		return (
			<div>
				<h4 className="page-header">
					{deleteButton}
					{headingText}
				</h4>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment}/>
					<br/>
					{downloadButton}
				</div>
			</div>
		);
	}
}
