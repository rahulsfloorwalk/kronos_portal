import React from 'react';

import { findAttachmentsByAuditStore } from '../service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File, DownloadAlt } from '../../js/components/Icons.jsx';
import Loading from '../../js/components/Loading.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../js/utils.js';

var AttachmentItem = React.createClass({
	getDefaultProps: function(){
		return {
			attachment: {}
		};
	},
	render: function(){
		switch(this.props.attachment.proof_type){
			case "AUDIO":
				var icon = <Record/>;
				break;
			case "PHOTO":
				var icon = <Picture/>;
				break;
			case "VIDEO":
				var icon = <Video/>;
				break;
			case "OTHER":
				var icon = <File/>;
				break;
		}
		return (
			<button type="button" className="list-group-item" onClick={()=>this.props.onSelect(this.props.attachment)}>
				{icon} {this.props.attachment.file_name}
			</button>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			attachments: [],
			selectedAttachment: undefined
		};
	},
	reloadState: function(){
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	},
	componentDidMount: function(){
		this.reloadState();
	},
	attachmentSelected: function(attachment){
		this.setState({
			selectedAttachment: attachment
		});
	},
	render: function(){

		var uploadButton;
		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} key={a.id} onSelect={this.attachmentSelected}/>);
		}

		let attachmentElement;
		if(this.state.selectedAttachment){
			switch(this.state.selectedAttachment.proof_type){
				case "AUDIO":
					attachmentElement = (
						<div className="text-center">
							<br/>
							<br/>
							<p><big>{this.state.selectedAttachment.file_name}</big></p>
							<audio controls>
								<source src={this.state.selectedAttachment.direct_url} 
									type={this.state.selectedAttachment.mime_type}/>
							</audio>
						</div>
					);
					break;
				case "PHOTO":
					let imageStyle = {"maxWidth": "100%"}
					attachmentElement = (
						<div className="text-center">
							<p><big>{this.state.selectedAttachment.file_name}</big></p>
							<img src={this.state.selectedAttachment.direct_url} style={imageStyle}/>
						</div>
					);
					break;
				case "VIDEO":
				case "OTHER":
					attachmentElement = (
						<div className="text-center">
							<br/>
							<br/>
							<p><big>{this.state.selectedAttachment.file_name}</big></p>
							<a className="btn btn-default" href={this.state.selectedAttachment.direct_url}>
								<DownloadAlt/> Download File
							</a>
						</div>
					);
					break;
			}
		}

		if( attachmentRows.length === 0){
			return null;
		} else {

		return (
				<div className="row">
					<div className="col-md-4">
						{attachmentRows}
					</div>
					<div className="col-md-8">
						{attachmentElement}
					</div>
				</div>
		);
		}
	},
});

