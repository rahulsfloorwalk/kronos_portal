import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../../components/AttachmentProofIcon.jsx";
// import InPlaceEditable from "../../components/InPlaceEditable.jsx";
import Loading from "../../../components/Loading.jsx";
import { DownloadAlt,  Cross } from "../../../components/Icons.jsx";
import { attachmentPropType } from "../../../auditor/prop_types.js";

import attachmentErrorImageUrl from "../../../../img/error_100.png";

import { Player, BigPlayButton  } from "video-react";
import AmrAudioPlayer from "../../../components/AmrAudioPlayer.jsx";

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
		this.setLoading(true);
		this.setError(false);
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
			let audio_player_node;
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
				<center>
					<p><b>Please download file if you are not able to play it.</b></p>
					<Player fluid={false} width={340} height={150} ref={node => this.player = node}>
						<BigPlayButton position="center" />
						<source src={this.props.attachment.direct_url} />
					</Player>
				</center>

			);
		}
		case "OTHER":
			return null;
		}
	}
}

export default class CAttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		onChange: PropTypes.func,
		handleSelectedAttachment:PropTypes.func,
		section_id: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
	};

	state = {
		display:"none"
	};
	handleLargeView = () => {
		this.props.handleSelectedAttachment();
	};
	render(){
		if(!this.props.attachment){
			return null;
		}


		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let closeButton;
		let headingText;
		closeButton = (<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.handleLargeView}><Cross/><b> Close</b></button>);
		headingText = (<h4>{icon} {this.props.attachment.file_name}</h4>);

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
		);
		return (
			<div>
				<div className="page-header" style={{padding:"0rem 2rem 1rem 2rem"}}>
					{closeButton}
					{headingText}
				</div>
				<div className="text-center" style={{paddingBottom:"1rem"}}>
					<AttachmentRenderer attachment={this.props.attachment}/>
					<br/>
					{downloadButton}
				</div>
			</div>
		);
	}
}
