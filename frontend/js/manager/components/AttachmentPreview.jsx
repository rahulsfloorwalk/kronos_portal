import React from 'react';
import { Link } from 'react-router';

import AttachmentProofIcon from '../../components/AttachmentProofIcon.jsx';
import Loading from '../../components/Loading.jsx';
import InPlaceEditable from '../../components/InPlaceEditable.jsx';

import { DownloadAlt, Save, Plus, Cross, Trash, Pencil, Tasks, OptionHorizontal, Checked, Unchecked, Paperclip } from '../../components/Icons.jsx';

class AttachmentRenderer extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			loading: true,
			error: false,
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	}
	setError = (error) => {
		this.setState((oldState) => Object.assign({}, oldState, { error }));
	}

	onLoad = (e) => {
		this.setLoading(false);
	}

	onError = (e) => {
		this.setError(true);
		this.setLoading(false);
	}

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
				return (
					<audio controls>
						<source src={this.props.attachment.direct_url} 
							type={this.props.attachment.mime_type}/>
					</audio>
				);
			}
				break;
			case "PHOTO": {
				let loading, error;
				if( this.state.loading){
					loading = <Loading/>;
				}
				if( this.state.error){
					error = (<div className="text-center">
						<img src="/static/img/error_100.png"/>
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
			case "VIDEO":
			case "OTHER":
				return null
		}
	}
}

export default class AttachmentPreview extends React.Component {

	constructor(props){
		super(props);
	}

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
