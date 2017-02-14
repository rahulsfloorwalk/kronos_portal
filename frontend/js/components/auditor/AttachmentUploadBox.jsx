import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findAttachmentsByAuditStore, uploadFileForAuditStore, deleteAttachment } from '../../auditor/service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File } from '../Icons.jsx';
import Loading from '../Loading.jsx';
import Jumbotron from '../Jumbotron.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AttachmentItem = React.createClass({
	getDefaultProps: function(){
		return {
			deletable: false,
			onDelete: () => {},
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
		if(this.props.deletable){
			var deleteButton = <button onClick={()=>this.props.onDelete(this.props.attachment)}
					className="btn btn-default btn-sm pull-right" 
					title="Delete Attachment"><Cross/>
				</button>;
		}
		return (
			<div className="list-group-item">
				{deleteButton}
				<big>{icon} <a href={this.props.attachment.direct_url} target="_blank" title="Click to download file">
					{this.props.attachment.file_name}
				</a></big>
			</div>
		);
	}
});

var AttachmentUploadBox = React.createClass({
	getInitialState: function(){
		return {
			uploadMessage : "",
			attachments: [],
			progress: "",
			uploading: false
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
	uploadButtonClicked: function(e){
		this.uploadInput.click();
	},
	uploadFile: function(e){
		if( this.uploadInput.files.length > 0){
			this.setState({
				uploading:true
			});
			var promise = uploadFileForAuditStore(this.props.auditStoreId, this.uploadInput.files[0]);
			promise.progress((type, percent)=>{
				if(type === "INIT"){
					this.setState({
						uploadMessage :"initializing upload",
					});
				}
				if(type === "STARTING_UPLOAD"){
					this.setState({
						uploadMessage :"starting upload",
					});
				}
				if(type === "UPLOAD_PROGRESS"){
					this.setState({
						uploadMessage :"",
						"progress": Math.floor(percent) + "%"
					});
				}
			});
			promise.always(()=>{
				this.setState({
					progress :"",
					uploading:false
				});
			});
			promise.then(()=>{
				this.setState({
					uploadMessage :"upload successful",
					progress: ""
				});
				this.reloadState();
			}, (errorMessage) => {
				this.setState({
					uploadMessage :"upload failed: " + errorMessage,
					progress: ""
				});
			});
		}
	},
	attachmentDeleteClicked: function(attachment){
		console.log(attachment,"deleted");
		deleteAttachment(attachment.id).then(()=>{
			this.reloadState();
		});
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let uploadButton;
		let deletable = false;
		if(this.props.auditStore.status === 'ASSIGNED'){
			uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default"><Paperclip/> Upload</button>);
			deletable = true;
		}

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} deletable={deletable} onDelete={this.attachmentDeleteClicked} key={a.id}/>);
		}

		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="list-group-item text-center text-muted">
					<h4>no attachments here</h4>
				</div>
			);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">
						<Paperclip/> Attachments
					</h4>
				</div>
				<div className="list-group" style={{"minHeight":"239px", "maxHeight":"250px", "overflowY":"auto"}}>
					{attachmentRows}
				</div>
				<div className="panel-footer text-right">
					<input type="file" 
						onChange={this.uploadFile} 
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						style={{"display":"none"}}/>
						{this.state.uploadMessage}&nbsp;{this.state.progress}&nbsp;{uploadButton}
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentUploadBox);
