import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findAttachmentsByAuditStore, deleteAttachment } from '../../manager/service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File, DownloadAlt } from '../Icons.jsx';
import Loading from '../Loading.jsx';
import Jumbotron from '../Jumbotron.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

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

var AttachmentDisplayBox = React.createClass({
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
	deleteButtonClicked: function(){
		if( this.state.selectedAttachment){
			deleteAttachment(this.state.selectedAttachment.id).then(() => {
				this.setState({
					selectedAttachment: null,
					attachments: this.state.attachments.filter((a) => a.id !== this.state.selectedAttachment.id)
				});
			});
		}
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} key={a.id} onSelect={this.attachmentSelected}/>);
		}

		let attachmentElement;
		if( this.props.auditStore.status === "SUBMITTED"){
			var deleteButton = (<button type="button" className="btn btn-default btn-sm pull-right" onClick={this.deleteButtonClicked}><Cross/> Delete</button>);
		}
		if(this.state.selectedAttachment){
			switch(this.state.selectedAttachment.proof_type){
				case "AUDIO":
					attachmentElement = (
						<div>
							<h4 className="page-header">
								{deleteButton}
								<Record/> {this.state.selectedAttachment.file_name}
							</h4>
							<div className="text-center">
								<audio controls>
									<source src={this.state.selectedAttachment.direct_url} 
										type={this.state.selectedAttachment.mime_type}/>
								</audio>
							</div>
						</div>
					);
					break;
				case "PHOTO":
					let imageStyle = {"maxWidth": "100%"}
					attachmentElement = (
						<div className="">
							<h4 className="page-header">
								{deleteButton}
								<Picture/> {this.state.selectedAttachment.file_name}
							</h4>
							<div className="text-center">
							<img src={this.state.selectedAttachment.direct_url} style={imageStyle}/>
							</div>
						</div>
					);
					break;
				case "VIDEO":
				case "OTHER":
					attachmentElement = (
						<div>
							<h4 className="page-header">
								{deleteButton}
								<File/> {this.state.selectedAttachment.file_name}
							</h4>
							<div className="text-center">
								<a className="btn btn-default" href={this.state.selectedAttachment.direct_url}>
									<DownloadAlt/> Download File
								</a>
							</div>
						</div>
					);
					break;
			}
		}

		if( attachmentRows.length === 0){
			return <Jumbotron heading="no attachments here" para="none uploaded"/>;
		} else {

		return (
			<div>
				<h3 className="page-header">
					<Paperclip/> Attachments
				</h3>
				<div className="row">
					<div className="col-md-4">
						{attachmentRows}
					</div>
					<div className="col-md-8">
						{attachmentElement}
					</div>
				</div>
			</div>
		);
		}
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.auditStoreId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AttachmentDisplayBox);
