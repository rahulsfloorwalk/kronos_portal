import React from "react";
// import ReactDOM from 'react-dom';

import AttachmentProofIcon from "../../../components/AttachmentProofIcon.jsx";
import Loading from "../../../components/Loading.jsx";

import { DownloadAlt } from "../../../components/Icons.jsx";
import { attachmentPropType } from "../../prop_types";

import attachmentErrorImageUrl from "../../../../img/error_100.png";

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
				"maxHeight": "200px",
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
					<Player fluid={false} width={350} height={150} ref={node => this.player = node}>
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
	};

	render(){
		if(!this.props.attachment){
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let headingText = (<span>{icon} {this.props.attachment.file_name}</span>);

		let downloadButton = (
			<a className="btn btn-default hidden-print" href={this.props.attachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
		);

		return (
			<div>
				<h5 className="page-header" style={{margin: "20px 0 10px", fontSize: "16px"}}>
					{headingText}
				</h5>
				<div className="text-center">
					<AttachmentRenderer attachment={this.props.attachment}/>
					<br/>
					{downloadButton}
				</div>
			</div>
		);
	}
}
