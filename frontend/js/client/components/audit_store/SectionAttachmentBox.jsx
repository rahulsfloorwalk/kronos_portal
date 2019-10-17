import React from "react";
import PropTypes from "prop-types";

import AttachmentThumbnail from "../../../components/AttachmentThumbnail.jsx";
import AttachmentPreview from "../../../manager/components/AttachmentPreview.jsx";

import { findAttachmentsByAuditStoreAndSection } from "../../service/attachment.js";

export default class SectionAttachmentBox extends React.Component{
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		sectionId: PropTypes.number.isRequired,
	};

	state = {
		attachments : [],
		selectedAttachmentId: null,
	};

	reloadAttachments = (auditStoreId, sectionId) =>  {
		findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount(){
		this.reloadAttachments(this.props.auditStoreId, this.props.sectionId);
	}

	componentWillReceiveProps(nextProps){
		this.reloadAttachments(nextProps.auditStoreId, nextProps.sectionId);
	}

	selectAttachment = (attachmentId) => {
		if( this.state.selectedAttachmentId === attachmentId){
			this.setState({
				selectedAttachmentId : null
			});
		} else {
			this.setState({
				selectedAttachmentId : attachmentId
			});
		}
	};

	render(){
		let editable = false;

		let attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentThumbnail
				attachment={a}
				key={a.id}
				onSelect={() => this.selectAttachment(a.id)}
				selected={this.state.selectedAttachmentId === a.id}
				user="client"
				faulty_report_id=""
			/>);
		}

		if( attachmentRows.length === 0){
			return null;
		}

		const selectedAttachment = this.state.attachments.filter( a => a.id === this.state.selectedAttachmentId)[0];
		return (
			<div className="panel-body">
				<div className="hidden-print">
					<h4>Attachments:</h4>
					{attachmentRows}
				</div>
				<div className="hidden-print">
					<AttachmentPreview attachment={selectedAttachment} editable={editable}/>
				</div>
			</div>
		);
	}
}
