import React from 'react';
import { Link } from 'react-router';

import AttachmentProofIcon from '../AttachmentProofIcon.jsx';
import InPlaceEditable from '../InPlaceEditable.jsx';

import { DownloadAlt, Save, Plus, Cross, Trash, Pencil, Tasks, OptionHorizontal, Checked, Unchecked, Paperclip } from '../Icons.jsx';

class AttachmentRenderer extends React.Component {
	constructor(props){
		super(props);
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
				let imageStyle = {"maxWidth": "100%"}
				return (<img src={this.props.attachment.direct_url} style={imageStyle}/>);
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
			<a className="btn btn-default" href={this.props.attachment.direct_url}>
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
