import React from "react";
import PropTypes from "prop-types";

import { findAttachmentsByAuditStore, findAttachmentsByAuditStoreAndSection } from "../../service/attachment.js";

import { Paperclip } from "../../../components/Icons.jsx";

import AttachmentPreview from "../../../manager/components/AttachmentPreview.jsx";

export default class AttachmentPrintRenderer extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		sections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			max_marks: PropTypes.number,
			sequence: PropTypes.number,
			name: PropTypes.string,
		})),
	};

	state = {
		attachments: [],
	};

	appendAttachments = (attachments) => this.setState((prevState) => Object.assign({}, prevState, {
		attachments: prevState.attachments.concat(attachments),
	}));

	reloadState = () => {
		findAttachmentsByAuditStore(this.props.auditStoreId).then(this.appendAttachments);
		this.props.sections.forEach((s) => {
			findAttachmentsByAuditStoreAndSection(this.props.auditStoreId, s.id).then(this.appendAttachments);
		});
	};

	componentDidMount() {
		this.reloadState();
	}

	componentWillReceiveProps() {
		this.reloadState();
	}

	render() {
		if( this.state.attachments.length === 0){
			return null;
		} else {
			return (<div>
				<h3 className="page-header">
					<Paperclip/> Attachments
				</h3>
				<div className="row">
					<div className="col-xs-offset-1 col-xs-10">
						{this.state.attachments.filter(a=>a.proof_type==="PHOTO").map( a => <AttachmentPreview key={a.id} attachment={a} editable={false}/>)}
					</div>
				</div>
			</div>);
		}
	}
}

