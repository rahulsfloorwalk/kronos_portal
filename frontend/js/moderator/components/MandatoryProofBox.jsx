import React from "react";
import PropTypes from "prop-types";
import { Tasks } from "../../components/Icons.jsx";
import { findMandatoryProofTags } from "../service/audit_store.js";
import MandatoryAttachmentThumbnail from "./MandatoryAttachmentThumbnail.jsx";
import { deleteAttachment } from "../service/attachment.js";
import { fetchproofTags, saveAttachmentTag } from "../service/proof_tag.js";

export default class MandatoryProofBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
			.isRequired,
		auditStore: PropTypes.shape({
			status: PropTypes.string.isRequired,
			audit: PropTypes.object,
		}),
		editable: PropTypes.bool,
		onReload: PropTypes.func,
		sectionproof_change: PropTypes.bool,
	};

	state = {
		mandatory_proof_tags: [],
		selectedAttachment: undefined,
		proof_tags: [],
	};

	// reloadState = () => {
	//   findMandatoryProofTags(this.props.auditStoreId).then(result=>{
	//     this.setState({mandatory_proof_tags:result})
	// })
	//   };

	reloadState = () => {
		findMandatoryProofTags(this.props.auditStoreId).then((result) => {
			this.setState({ mandatory_proof_tags: result }, () => {
				// Call the parent's callback after state update
				if (this.props.onReload) {
					this.props.onReload();
				}
			});
		});
	};

	componentDidMount() {
		this.reloadState();
		fetchproofTags(this.props.auditStore.audit.audit_cycle.id).then(
			(proof_tags) => {
				this.setState({
					proof_tags,
				});
			}
		);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.sectionproof_change !== this.props.sectionproof_change) {
			this.reloadState();
		}
	}

	groupedProofTags = (mandatoryprooftag) => {
		const grouped = {};

		mandatoryprooftag.forEach((item) => {
			const tagId = item.proof_tag_id;
			if (!grouped[tagId]) {
				grouped[tagId] = {
					tagName: item.proof_tag_name,
					attachments: [],
				};
			}
			grouped[tagId].attachments.push(item);
		});

		return Object.values(grouped);
	};
	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment,
		});
	};

	deleteButtonClicked = (attachmentId) => {
		deleteAttachment(attachmentId).then(() => {
			this.setState({
				selectedAttachment: null,
				mandatory_proof_tags: this.state.mandatory_proof_tags.filter(
					(a) => a.id !== attachmentId
				),
			});
			if (this.props.onReload) {
				this.props.onReload();
			}
		});
	};

	saveAttachmentTag = (attachment_id, e) => {
		saveAttachmentTag(attachment_id, e.target.value).then((a) => {
			this.setState({
				selectedAttachment: a,
			});
			for (let i in this.state.mandatory_proof_tags) {
				if (this.state.mandatory_proof_tags[i].id === a.id) {
					let arr = this.state.mandatory_proof_tags;
					arr[i] = a;
					this.setState({
						mandatory_proof_tags: arr,
					});
					this.reloadState();
				}
			}
		});
	};
	render() {
		const groupedTags = this.groupedProofTags(this.state.mandatory_proof_tags);

		return (
			<div className="row">
				<div className="col-md-12">
					<h3>
						<Tasks /> Mandatory Prooftag List
					</h3>

					<div
						style={{
							border: "1px solid #ddd",
							margin: "1rem",
							marginTop: "2rem",
						}}
					>
						<table className="table" style={{ marginBottom: 0 }}>
							<thead>
								<tr>
									<th style={{ width: "25%", borderRight: "1px solid #ddd" }}>
										Prooftag Name
									</th>
									<th>Mandatory Attachments</th>
								</tr>
							</thead>
							<tbody>
								{groupedTags.length > 0 ? (
									groupedTags.map((group, idx) => (
										<tr key={idx} style={{ borderTop: "1px solid #ddd" }}>
											<td
												style={{
													borderRight: "1px solid #ddd",
													padding: "1rem",
													whiteSpace: "pre-wrap",
												}}
											>
												{group.tagName}
											</td>
											<td style={{ padding: "1rem" }}>
												<ul style={{ margin: 0, paddingLeft: "1rem" }}>
													{group.attachments.map((a) => (
														<MandatoryAttachmentThumbnail
															attachment={a}
															key={a.id}
															onSelect={() => this.attachmentSelected(a)}
															// onDelete={this.deleteButtonClicked}
															onDelete={() => this.deleteButtonClicked(a.id)}
															selected={
																a.id ===
																(this.state.selectedAttachment &&
																	this.state.selectedAttachment.id)
															}
															user="moderator"
															editable={this.props.editable}
															deletable={this.props.editable}
															faulty_report_id={a.faulty_report_id}
															faulty_attachment_url={a.faulty_attachment_url}
															proof_tags={this.state.proof_tags}
															section_id={0}
															onChange={(e) => this.saveAttachmentTag(a.id, e)}
														/>
													))}
												</ul>
											</td>
										</tr>
									))
								) : (
									<tr style={{ borderTop: "1px solid #ddd" }}>
										<td
											style={{
												borderRight: "1px solid #ddd",
												padding: "1rem",
												whiteSpace: "pre-wrap",
											}}
										>
											---
										</td>
										<td style={{ padding: "1rem" }}>---</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}