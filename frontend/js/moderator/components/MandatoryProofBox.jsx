import React from "react";
import PropTypes from "prop-types";
import { Tasks } from "../../components/Icons.jsx";
import { findMandatoryProofTags } from "../service/audit_store.js";
import MandatoryAttachmentThumbnail from "./MandatoryAttachmentThumbnail.jsx";

export default class MandatoryProofBox extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
			.isRequired,
	};

	state = {
		mandatory_proof_tags: [],
	};

	componentDidMount() {
		findMandatoryProofTags(this.props.auditStoreId).then(result => {
			this.setState({ mandatory_proof_tags: result });
		});
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
								{groupedTags.length > 0 ?
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
														/>
													))}
												</ul>
											</td>
										</tr>
									)) :
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
										<td style={{ padding: "1rem" }}>
											---
										</td>
									</tr>
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}