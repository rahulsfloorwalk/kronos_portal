import React from "react";
import PropTypes from "prop-types";

import { findAttachmentsByAuditStore } from "../service/attachment.js";

import { Paperclip } from "../../components/Icons.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import AttachmentPreview from "../../manager/components/AttachmentPreview.jsx";

import AttachmentThumbnail from "../../components/AttachmentThumbnail.jsx";

export default class AttachmentDisplayBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		printMode: PropTypes.bool,
	};

	static defaultProps = {
		printMode: false,
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
			attachmentRows.push(<AttachmentThumbnail
				attachment={a}
				key={a.id}
				onSelect={() => this.attachmentSelected(a)}
				selected={this.state.selectedAttachmentId === a.id}
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
			if(this.props.printMode){
				return (<div className="row">
					<div className="col-xs-offset-1 col-xs-10">
						{this.state.attachments.filter(a=>a.proof_type==="PHOTO").map( a => <AttachmentPreview key={a.id} attachment={a} editable={false}/>)}
					</div>
				</div>);
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
}

