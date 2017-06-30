import React from 'react';

import { findAttachmentsByAuditStore } from '../service/attachment.js';

import { Paperclip, Cross, Record, Picture, Video, File, DownloadAlt } from '../../js/components/Icons.jsx';
import Loading from '../../js/components/Loading.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

import AttachmentPreview from '../../js/components/manager/AttachmentPreview.jsx';

import AttachmentProofIcon from '../../js/components/AttachmentProofIcon.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../js/utils.js';

var AttachmentItem = React.createClass({
	getDefaultProps: function(){
		return {
			attachment: {}
		};
	},
	render: function(){
		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		let activeClass = this.props.selected ? "active" : "";
		return (
			<button type="button" className={`list-group-item ${activeClass}`} onClick={()=>this.props.onSelect(this.props.attachment)}>
				{icon} {this.props.attachment.file_name}
			</button>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			attachments: [],
			selectedAttachment: undefined,
			selectedAttachmentId: null,
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
			selectedAttachment: attachment,
			selectedAttachmentId: attachment.id,
		});
	},
	render: function(){

		var uploadButton;
		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} key={a.id} onSelect={this.attachmentSelected} selected={this.state.selectedAttachmentId === a.id}/>);
		}

		let attachmentElement;
		if(this.state.selectedAttachment){
			let downloadButton = (
			<a className="btn btn-default" href={this.state.selectedAttachment.direct_url}>
				<DownloadAlt/> Download File
			</a>
			);
			attachmentElement = <AttachmentPreview attachment={this.state.selectedAttachment} editable={false}/>;
		} else {
			attachmentElement = (<Jumbotron heading={<div><br/><br/><br/><Paperclip/></div>} para={<span>select an attachment from the list<br/><br/><br/><br/></span>}/>);
		}

		if( attachmentRows.length === 0){
			return null;
		} else {

		return (
				<div className="row">
					<div className="col-md-4 hidden-print">
						{attachmentRows}
					</div>
					<div className="col-md-8 hidden-print">
						{attachmentElement}
					</div>
					<div className="col-xs-offset-1 col-xs-10 visible-print-block">
						{this.state.attachments.filter(a=>a.proof_type==="PHOTO").map( a => <AttachmentPreview attachment={a} editable={false}/>)}
					</div>
				</div>
		);
		}
	},
});

