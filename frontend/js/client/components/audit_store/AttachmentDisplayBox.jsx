import React from "react";
import PropTypes from "prop-types";

import { findAttachmentsByAuditStore } from "../../service/attachment.js";

import { Paperclip } from "../../../components/Icons.jsx";
import Jumbotron from "../../../components/Jumbotron.jsx";

import AttachmentPreview from "./AttachmentPreview.jsx";

import ClientAttachmentThumbnail from "../../../components/ClientAttachmentThumbnail.jsx";

export default class AttachmentDisplayBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
	};

	state = {
		attachments: [],
		selectedAttachment: undefined,
		selectedAttachmentId: null,
	};

	reloadState = () => {
		findAttachmentsByAuditStore(this.props.auditStoreId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount() {
		this.reloadState();
	}

	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment,
			selectedAttachmentId: attachment.id,
		});
	};

	render() {
		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<ClientAttachmentThumbnail
				attachment={a}
				key={a.id}
				onSelect={() => this.attachmentSelected(a)}
				selected={this.state.selectedAttachmentId === a.id}
				user="client"
				faulty_report_id=""
			/>);
		}

		let attachmentElement;
		if(this.state.selectedAttachment){
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
				</div>
			);
		}
	}
}

