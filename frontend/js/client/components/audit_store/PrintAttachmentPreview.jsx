import React from "react";
// import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

import AttachmentProofIcon from "../../../components/AttachmentProofIcon.jsx";
import Loading from "../../../components/Loading.jsx";

import { DownloadAlt } from "../../../components/Icons.jsx";
import { attachmentPropType } from "../../prop_types";

import attachmentErrorImageUrl from "../../../../img/error_100.png";

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
	}

	render(){
		switch(this.props.attachment.proof_type){
		case "AUDIO": {
			return null;
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
			return null;
		}
		case "OTHER":
			return null;
		}
	}
}

export default class PrintAttachmentPreview extends React.Component {
	static propTypes = {
		attachment: attachmentPropType,
		editable: PropTypes.bool,
	};

	render(){
		if(!this.props.attachment){
			return null;
		}

		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let headingText;

		headingText = (<span>{icon} {this.props.attachment.file_name}</span>);

		let downloadButton = (
			<a className="btn btn-default" href={this.props.attachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
		);

		return (
			<div>
				<h4 className="page-header">
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
