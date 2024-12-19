import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";
import Alert from "react-s-alert";
import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStore, acknowledgeAuditStore, submitAuditStore, arrangeAttachment,FetchGuidlineByAuditStore, FetchFeedbackByAuditStore } from "../actions/audit_store.js";

import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";

import AttachmentUploadBox from "./AttachmentUploadBox.jsx";
import ReportSummary from "./ReportSummary.jsx";
import NpsSection from "./NpsSection.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import SectionList from "./questionnaire/SectionList.jsx";

import { getAuditType } from "../../utils.js";
import { auditStorePropType } from "../prop_types";
// import { saveReportModal } from "../service/report_section.js";
import Modal from "../../components/Modal.jsx";
import SaveButton from "../../components/SaveButton.jsx";
// import FormInput from "../../components/FormInput.jsx";
import { saveReportModal } from "../service/report_section.js";
// import FormSelect from "../../components/FormSelect.jsx";

class AuditStoreDetails extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
		children: PropTypes.node,
	};

	state = {
		submitMessage : "",
		submitStatus: "",
		showErrors: false,
		guideline:"",
		submitModalOpen: false,
		submitModalform:"",
		reportErrorfield:"",
	};

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		FetchGuidlineByAuditStore(this.props.params.auditStoreId).then((guideline)=> this.setState({guideline:guideline}));

		FetchFeedbackByAuditStore(this.props.params.auditStoreId).then((report_feedback) => {
			this.setState({
				understanding_rating: report_feedback.audit_understanding,
				rating: report_feedback.coordination,
				submitModalform : report_feedback.portal_accessibility
			});
		});
	}

	submitButtonClicked = () => {
		this.setState({showErrors: false,submitMessage: ""});
		var promise = this.props.dispatch(submitAuditStore(this.props.params.auditStoreId));
		promise.then(() => {
			this.setState({
				submitMessage : "Report submitted successfully",
				submitStatus: "success",
			});
			Alert.success("Report submitted successfully");
			this.setState({ submitModalOpen: true});
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
			Alert.error(err.responseJSON.non_field_errors[0], {timeout:7000});
		});
	};

	acknowledgeButtonClicked = () => {
		var promise = this.props.dispatch(acknowledgeAuditStore(this.props.params.auditStoreId));
		promise.then(() => {
			this.setState({
				// submitMessage : "You have agreed to conduct the audit. Audit is now in progress.",
				submitMessage : "You have agreed to complete the audit. Please proceed with audit, your audit is now under progress.",
				submitStatus: "success",
			});
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
	};

	isReportEditable = () => {
		return this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED";
	};

	arrangeAttachmentByProofTag = () => {
		arrangeAttachment(this.props.params.auditStoreId).then(() => {
			location.reload();
		});
	};
	openPDFInNewTab = () => {
		const { guideline } = this.state;
		window.open(guideline, "_blank");
	};
	inputChanged = (e) => {
		this.setState({
			// submitModalform: Object.assign({}, this.state.submitModalform, {
			// 	[e.target.name] : e.target.value,
			// })
			submitModalform: e.target.value
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		const { auditStoreId } = this.props.params;
		if (!this.state.understanding_rating || !this.state.rating || !this.state.submitModalform) {
			// Alert.error("Please fill in all required fields.", { timeout: 5000 });
			this.setState({reportErrorfield: "Please fill in all required fields."});
			let timeout = setTimeout(() => {
				this.setState({reportErrorfield: ""});
			}, 3000);
			return ()=> clearTimeout(timeout);
		}
		saveReportModal(auditStoreId, this.state.understanding_rating, this.state.rating, this.state.submitModalform).then(() => {
			this.setState({ submitModalOpen: false });
		}).catch((error) => {
			console.error("Error saving report modal:", error);
		});
	};

	// onSubmit = (e) => {
	// 	e.preventDefault();
	// 	const { auditStoreId } = this.props.params;
	// 	saveReportModal(auditStoreId, this.state.understanding_rating,this.state.rating,this.state.submitModalform).then(() => {
	// 		// Handle success if needed;
	// 	});
	// 	// .catch((error) => {
	// 	// 	// Handle error if needed
	// 	// });
	// 	this.setState({submitModalOpen:false});
	// };

	ratingSelected = (rating) => {
		this.setState({rating});
	};
	understandingRatingSelected = (understanding_rating) => {
		this.setState({understanding_rating});
	};
	render() {
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let submitAuditButton, acknowledgeButton, performAuditButton, concernButton, attachmentArrangeButton;
		if(this.props.auditStore.status === "ASSIGNED"){
			acknowledgeButton = (
				<span>
					<button onClick={this.acknowledgeButtonClicked} type="button" className="btn btn-primary btn-lg">
				Agree
					</button>
				&nbsp;
				&nbsp;
					<big>Click on <b>Agree</b> button if you are ready to conduct the audit and have understood <b>audit guidelines</b> and <b>questionnaire</b> thoroughly.</big>
				</span>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Having Trouble ?</Link>);
		}
		if(this.props.auditStore.status === "ACKNOWLEDGED"){
			submitAuditButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary btn-lg">Submit Report</button>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Having Trouble ?</Link>);
			// attachmentArrangeButton = <button className="btn btn-lg btn-primary" style={{marginLeft:"10px"}} onClick={this.arrangeAttachmentByProofTag}>Send proofs to relevant sections</button>;
		}

		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b> ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

		const manager_info_list = this.props.auditStore.manager_info_list;
		let mngr_cntct = "";
		if (manager_info_list && manager_info_list.length > 0) {
			const contactString = manager_info_list.map(manager => `${manager.name} (${manager.mobile})`).join(", ");
			mngr_cntct = <span><b>{contactString}</b></span>;
		}

		// const manager_name_list = this.props.auditStore.manager_name_list;
		// let mngr_name = "";
		// if (manager_name_list && manager_name_list.length > 0) {
		// mngr_name = (
		// 	<span>
		// 	<b>{manager_name_list.join(', ')}</b>
		// 	</span>
		// );
		// }

		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		let buttonPanel = (
			<div className="form-group">
				{acknowledgeButton}{submitAuditButton}{attachmentArrangeButton}&nbsp;&nbsp;{submitMessageElement}
			</div>);

		const support_page_link = this.props.auditStore.audit.audit_cycle.support_page_link;
		const support_button = support_page_link ? <a href={support_page_link} target="_blank" rel="noopener noreferrer" style={{marginRight: "1%"}} className="btn btn-primary pull-right"><span style={{animation: "blink 1s linear infinite",fontWeight:"bold"}}>Need support for {this.props.auditStore.audit.audit_cycle.client.auditor_display_name}?</span></a> : null;

		return (
			<div>
				<div className="row">
					{performAuditButton}{concernButton}{support_button}
				</div>
				<h2 className="page-header"><b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> [Report ID: {this.props.params.auditStoreId}]</h2>
				<div className="row">
					{!this.state.guideline ?
						<div>
							<div className="col-md-5">
								<div className="panel panel-default">
									<table className="table table-striped">
										<tbody>
											<tr>
												<td className="text">Type:</td>
												<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
											</tr>
											<tr>
												<td className="text">Store Name:</td>
												<th>{this.props.auditStore.audit.store.name}</th>
											</tr>
											<tr>
												<td className="text">Phone:</td>
												<th>{this.props.auditStore.audit.store.phone}</th>
											</tr>
											<tr>
												<td className="text">Address:</td>
												<th>{this.props.auditStore.audit.store.address}</th>
											</tr>
											<tr>
												<td className="text">Fees:</td>
												<th>{<span>{fees}{reimb}</span>}</th>
											</tr>
											<tr>
												<td className="text">Audit Date:</td>
												<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
											</tr>
											<tr>
												<td className="text">Status:</td>
												<th>{<AuditStoreStatusLabel status={this.props.auditStore.status}/>}
												</th>
											</tr>
											<tr>
												<td className="text">Manager Contacts:</td>
												<th>{mngr_cntct}</th>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div className="col-md-7">
								<td className="text-right"style={{ fontSize: "16px", }}><b> Guidelines:-</b></td>
								{ this.props.auditStore.audit.audit_cycle.post_approval_description ?
									<div className="panel-body" style={{ marginTop: "-20px" }}>
										{/* <MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/> */}
										<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
									</div>
									: null }
							</div>
						</div>
						:
						<div className="col-md-12">
							<div className="panel panel-default">
								<table className="table table-striped">
									<tbody>
										<tr>
											<td className="text">Type:</td>
											<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
										</tr>
										<tr>
											<td className="text">Store Name:</td>
											<th>{this.props.auditStore.audit.store.name}</th>
										</tr>
										<tr>
											<td className="text">Phone:</td>
											<th>{this.props.auditStore.audit.store.phone}</th>
										</tr>
										<tr>
											<td className="text">Address:</td>
											<th>{this.props.auditStore.audit.store.address}</th>
										</tr>
										<tr>
											<td className="text">Fees:</td>
											<th>{<span>{fees}{reimb}</span>}</th>
										</tr>
										<tr>
											<td className="text">Audit Date:</td>
											<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
										</tr>
										<tr>
											<td className="text">Status:</td>
											<th>{<AuditStoreStatusLabel status={this.props.auditStore.status}/>}
											</th>
										</tr>
										<tr>
											<td className="text">Manager Contacts:</td>
											<th>{mngr_cntct}</th>
										</tr>
										{this.state.guideline && this.state.guideline ?
											<tr>
												<td className="text">PDF Guideline:</td>
												<th><button className="btn btn-primary sm" onClick={this.openPDFInNewTab}>Open Guideline</button></th>
											</tr>
											: null}
									</tbody>
								</table>
							</div>
						</div>
					}
					<div className="col-md-6">
					</div>
					<div className="col-md-12">
						<td className="text-right"style={{ fontSize: "16px", }}><b> Audit Notes :-</b></td>
						{ ( this.props.auditStore.audit.post_approval_description ) ?
							<div className="panel-body" style={{ marginTop: "-20px" }}>
								<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
							</div>
							: null }
					</div>

				</div>
				{buttonPanel}
				<AttachmentUploadBox auditStoreId={this.props.params.auditStoreId} editable={this.isReportEditable()}/>
				{/* <ReportSummary audit_store_id={this.props.params.auditStoreId} report_summary={this.props.auditStore.report_summary} editable={this.isReportEditable()} showErrors={this.state.showErrors} /> */}
				{this.props.auditStore.audit.audit_cycle.audit_report_summary ?
					<ReportSummary audit_store_id={this.props.params.auditStoreId} report_summary={this.props.auditStore.report_summary} editable={this.isReportEditable()} showErrors={this.state.showErrors} />
					: null}
				<SectionList auditStoreId={this.props.params.auditStoreId} showErrors={this.state.showErrors} editable={this.isReportEditable()} auditStore={this.props.auditStore}/>
				<NpsSection audit_store_id={this.props.params.auditStoreId} nps_section={this.props.auditStore.nps_section} editable={this.isReportEditable()} showErrors={this.state.showErrors} />
				{buttonPanel}
				{this.props.children}
				{this.state.submitModalOpen ?
					<Modal modalTitle="Please rate your experience with us" onClose={()=>this.setState({submitModalOpen:false})}>
						{/* <div className="form-group"><big><i>fields marked <b className="text-danger">✳</b> must be filled to apply to audits</i></big></div> */}
						<div className="form-group"><big><i>Rate your Audit completion journey with FloorWalk on the basis of:</i></big></div>
						<form onSubmit={this.onSubmit}>
							{/* <FormInput label="Audit Guidelines & Questionnaire understanding" type="number" value={this.state.submitModalform.audit_understanding} name="audit_understanding" onChange={this.inputChanged} /> */}

							<div className="form-group">
								<label className="control-label">Audit Guidelines & Questionnaire understanding :</label>
								<div className="star-rating star-rating-lg">
									<input type="radio" id="understanding_5-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(5)} checked={this.state.understanding_rating === 5}/>
									<label htmlFor="understanding_5-stars" className="star">&#9733;</label>
									<input type="radio" id="understanding_4-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(4)} checked={this.state.understanding_rating === 4}/>
									<label htmlFor="understanding_4-stars" className="star">&#9733;</label>
									<input type="radio" id="understanding_3-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(3)} checked={this.state.understanding_rating === 3}/>
									<label htmlFor="understanding_3-stars" className="star">&#9733;</label>
									<input type="radio" id="understanding_2-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(2)} checked={this.state.understanding_rating === 2}/>
									<label htmlFor="understanding_2-stars" className="star">&#9733;</label>
									<input type="radio" id="understanding_1-star" name="understanding_rating" onChange={() => this.understandingRatingSelected(1)} checked={this.state.understanding_rating === 1}/>
									<label htmlFor="understanding_1-star" className="star">&#9733;</label>
								</div>
							</div>
							<div className="form-group">
								<label className="control-label">Coordination with FloorWalk Team :</label>
								<div className="star-rating star-rating-lg">
									<input type="radio" id="5-stars" name="rating" onChange={() => this.ratingSelected(5)} checked={this.state.rating === 5}/>
									<label htmlFor="5-stars" className="star">&#9733;</label>
									<input type="radio" id="4-stars" name="rating" onChange={() => this.ratingSelected(4)} checked={this.state.rating === 4}/>
									<label htmlFor="4-stars" className="star">&#9733;</label>
									<input type="radio" id="3-stars" name="rating" onChange={() => this.ratingSelected(3)} checked={this.state.rating === 3}/>
									<label htmlFor="3-stars" className="star">&#9733;</label>
									<input type="radio" id="2-stars" name="rating" onChange={() => this.ratingSelected(2)} checked={this.state.rating === 2}/>
									<label htmlFor="2-stars" className="star">&#9733;</label>
									<input type="radio" id="1-star" name="rating" onChange={() => this.ratingSelected(1)} checked={this.state.rating === 1}/>
									<label htmlFor="1-star" className="star">&#9733;</label>
								</div>
							</div>
							<textarea rows="3" maxLength="5096" className="form-control" name="Any other feedback " value={this.state.submitModalform} onChange={this.inputChanged} placeholder="Any other feedback" />
							{this.state.reportErrorfield ? <p style={{color:"red",fontSize :"14px", margin :"10px"}}>{this.state.reportErrorfield}</p> : null}
							<SaveButton />
						</form>

					</Modal>
					:
					null}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
