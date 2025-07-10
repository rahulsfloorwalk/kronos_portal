import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import $ from "jquery";

import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import moment from "moment";
import { momentDateFormat } from "../../../config.js";

import { findById, qaOk, fail, unsubmit, submit, setAuditDate, setAuditModeratorStatus, setAuditModeratorComment, saveCheckList, arrangeAttachment, findProofNotAvailable } from "../service/audit_store.js";

import { Calendar, File, Envelope } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import AuditStoreRating from "../../components/AuditStoreRating.jsx";
import StarRating from "../../components/StarRating.jsx";

import AttachmentBox from "./AttachmentBox.jsx";
import AuditStoreSections from "./AuditStoreSections.jsx";
import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import ReportSummary from "./ReportSummary.jsx";
import { fetchproofTags } from "../service/proof_tag.js";
import { FetchGuidlineByAuditStoreModerator } from "../service/audit_store.js";
import ProofNotAvailable from "./ProofNotAvailable.jsx";
import "../../../css/bs_overrides.scss";
import MandatoryProofBox from "./MandatoryProofBox.jsx";

export default class AuditStoreDetails extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			auditStore: null,
			auditDateLoading: false,
			auditDateSuccess: false,
			auditDateError: false,
			errorMessage: "",
			display: "none",
			reason: "",
			errMsg: "",
			proof_tags: [],
			guideline: "",
			proof_not_available: [],
			reloadKey: 0,
			sectionproof_change: false,
			// timerValue: 0,
			// isTimerRunning: false,
			// forwardLoading: false,
		};
		this.timerValue = 0; // Store timer value in a class property
		this.isTimerRunning = false; // Track timer state
		this.timerInterval = null; // Store interval ID
	}
	setAuditStore = (auditStore) => {
		this.setState({
			auditStore
		});
	};
	componentDidMount() {
		findById(this.props.params.auditStoreId).then((auditStore) => {
			this.setAuditStore(auditStore);
			this.initializeTimer(); // Initialize timer after auditStore is set
		});
		findProofNotAvailable(this.props.params.auditStoreId).then(result => {
			this.setState({ proof_not_available: result });
		});
		FetchGuidlineByAuditStoreModerator(this.props.params.auditStoreId).then((guideline) => this.setState({ guideline: guideline }));
		document.addEventListener("visibilitychange", this.handleVisibilityChange); // Add visibility change listener
		window.addEventListener("storage", this.handleStorageChange);  // Add storage event listener for cross-tab sync
	}
	componentDidUpdate(prevProps, prevState) {
		if (
			this.state.auditStore &&
			this.state.auditStore.status === "SUBMITTED" &&
			this.props.location.pathname === `/audit_store/${this.props.params.auditStoreId}/report` &&
			!document.hidden &&
			!this.isTimerRunning
		) {
			this.startTimer();
		} else if (
			(this.state.auditStore && this.state.auditStore.status !== "SUBMITTED") ||
			this.props.location.pathname !== `/audit_store/${this.props.params.auditStoreId}/report` ||
			document.hidden
		) {
			this.stopTimer();
		}
		if (
			prevState.auditStore !== this.state.auditStore &&
			this.state.auditStore &&
			this.state.auditStore.status === "SUBMITTED"
		) {
			this.initializeTimer();
		}
	}
	componentWillReceiveProps(nextProps) {
		findById(nextProps.params.auditStoreId).then(this.setAuditStore);
	}

	componentWillUnmount() {
		this.stopTimer();
		document.removeEventListener("visibilitychange", this.handleVisibilityChange);
		window.removeEventListener("storage", this.handleStorageChange);
	}

	parseTimeToSeconds = (timeString) => {
		if (!timeString) return 0;
		const [hours, minutes, seconds] = timeString.split(":").map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	};

	initializeTimer = () => {
		const savedTime = localStorage.getItem(`timer_${this.props.params.auditStoreId}`);
		this.timerValue = savedTime
			? parseInt(savedTime, 10)
			: this.state.auditStore && this.state.auditStore.status === "SUBMITTED" && this.state.auditStore.moderator_submission_time
				? this.parseTimeToSeconds(this.state.auditStore.moderator_submission_time)
				: 0;
		if (this.state.auditStore && this.state.auditStore.status === "SUBMITTED") {
			localStorage.setItem(`timer_${this.props.params.auditStoreId}`, this.timerValue);
		}
		this.updateTimerDisplay();
		if (
			this.state.auditStore &&
			this.state.auditStore.status === "SUBMITTED" &&
			this.props.location.pathname === `/audit_store/${this.props.params.auditStoreId}/report` &&
			!document.hidden &&
			!this.isTimerRunning
		) {
			this.startTimer();
		}
	};

	updateTimerDisplay = () => {
		const timerElement = document.getElementById("timer-display");
		if (timerElement) {
			timerElement.textContent = this.formatTime(this.timerValue);
		}
	};

	startTimer = () => {
		if (!this.isTimerRunning) {
			this.isTimerRunning = true;
			this.timerInterval = setInterval(() => {
				this.timerValue += 1;
				if (this.timerValue % 5 === 0) {
					localStorage.setItem(`timer_${this.props.params.auditStoreId}`, this.timerValue.toString());
				}
				this.updateTimerDisplay();
			}, 1000);
		}
	};

	stopTimer = () => {
		if (this.isTimerRunning) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
			if (this.timerValue > 0 && this.state.auditStore && this.state.auditStore.status === "SUBMITTED") {
				localStorage.setItem(`timer_${this.props.params.auditStoreId}`, this.timerValue.toString());
			}
			this.isTimerRunning = false;
			this.updateTimerDisplay();
		}
	};

	handleVisibilityChange = () => {
		if (
			document.hidden ||
			this.props.location.pathname !== `/audit_store/${this.props.params.auditStoreId}/report`
		) {
			this.stopTimer();
		} else if (
			this.state.auditStore && this.state.auditStore.status === "SUBMITTED" &&
			!this.isTimerRunning
		) {
			this.startTimer();
		}
	};

	handleStorageChange = (event) => {
		if (event.key === `timer_${this.props.params.auditStoreId}`) {
			const newValue = parseInt(event.newValue, 10);
			if (!isNaN(newValue)) {
				this.timerValue = newValue;
				this.updateTimerDisplay();
			}
		}
	};

	formatTime = (seconds) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	formatTimewWithHourMinute = (timeString) => {
		if (!timeString || timeString === "00:00:00") {
			return "0 hours 0 minutes 0 seconds";
		}
		const [hours, minutes, seconds] = timeString.split(":").map(Number);
		return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
	};

	handleMandatoryProofReload = () => {
		// Increment reloadKey to force AuditStoreSections to remount
		this.setState((prevState) => ({
			reloadKey: prevState.reloadKey + 1,
		}));
	};

	handleSectionProofChange = () => {
		this.setState((prev)=>({
			sectionproof_change : !prev.sectionproof_change
		}));
	};

	qaOkButtonClicked = () => {
		const totalTime = localStorage.getItem(`timer_${this.props.params.auditStoreId}`);
		let moderatorSubmissionTime;
		if (totalTime) {
			const seconds = parseInt(totalTime, 10);
			moderatorSubmissionTime = this.formatTime(seconds);
		}
		qaOk(this.props.params.auditStoreId, moderatorSubmissionTime)
			.then((auditStore) => {
				localStorage.removeItem(`timer_${this.props.params.auditStoreId}`);
				this.setAuditStore(auditStore);
			})
			.catch((err) => {
				if (err.responseJSON && err.responseJSON.non_field_errors) {
					this.setState({
						errorMessage: err.responseJSON.non_field_errors[0],
					});
				}
			});
	};
	failButtonClicked = () => {
		fail(this.props.params.auditStoreId).then(this.setAuditStore);
	};
	submitButtonClicked = () => {
		submit(this.props.params.auditStoreId).then(this.setAuditStore);
	};
	showModal = () => {
		fetchproofTags(this.state.auditStore.audit.audit_cycle.id).then((proof_tags) => {
			this.setState({
				proof_tags: proof_tags,
				display: "block"
			});
		});
	};

	hideModal = () => {
		this.setState({ display: "none", errMsg: "" });
	};
	submit_hideModal = () => {
		if (this.state.reason === "") {
			this.setState({ errMsg: "Please enter reason" });
		}
		else {
			this.unSubmitButtonClicked();
			this.setState({ display: "none" });
		}
	};

	reasonChanged = (e) => {
		this.setState({
			reason: e.target.value,
			errMsg: ""
		});
	};

	onBlur = (e) => {
		this.reasonChanged(e);
	};

	unSubmitButtonClicked = () => {
		let missing_proofs = [];
		$(".revert_tags input:checked").each(function () {
			let val = $(this).attr("value");
			missing_proofs.push(val);
		});
		unsubmit(this.props.params.auditStoreId, this.state.reason, missing_proofs).
			then(() => {
				this.setAuditStore;
				location.reload();
			});
	};
	auditDateChanged = (momentDate) => {
		this.setState({ auditDateLoading: true });
		//FIXME: momentDate#format is not a function
		setAuditDate(this.state.auditStore.id, momentDate.format("YYYY-MM-DD")).then((auditStore) => {
			this.setAuditStore(auditStore);
			this.setState({ auditDateSuccess: true, auditDateError: false });
		}, () => {
			this.setState({ auditDateSuccess: false, auditDateError: true });
		}).always(() => {
			this.setState({ auditDateLoading: false });
		});
	};
	setModeratorStatus = (e) => {
		setAuditModeratorStatus(this.props.params.auditStoreId, e.target.value).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
	};
	setModeratorComment = (e) => {
		setAuditModeratorComment(this.props.params.auditStoreId, e.target.value);
	};
	openCheckPoint = () => {
		document.getElementsByClassName("main")[0].style.marginRight = "250px";
		document.getElementsByClassName("sidebar")[0].style.width = "250px";
		document.getElementsByClassName("checkpoint")[0].style.display = "none";
	};
	closeCheckPoint = () => {
		document.getElementsByClassName("main")[0].style.marginRight = "0";
		document.getElementsByClassName("sidebar")[0].style.width = "0";
		document.getElementsByClassName("checkpoint")[0].style.display = "block";
	};
	saveCheckPoints = () => {
		let check_points_list = [];
		$(".sidebar input:checked").each(function () {
			let val = $(this).attr("value");
			check_points_list.push(val);
		});
		saveCheckList(this.props.params.auditStoreId, check_points_list).then((auditStore) => {
			this.setAuditStore(auditStore);
			this.closeCheckPoint();
		});
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
	render() {
		if (!this.state.auditStore) {
			return <Loading />;
		}
		var paddingStyle = {
			paddingBottom: "2%"
		};
		var faultyReportMessageStyle = {
			fontSize: "16px",
			color: "red",
			paddingRight: "5px",
			paddingTop: "1%"
		};
		const modalStyle = {
			display: this.state.display,
			overflow: "scroll"
		};
		const modalBackdropStyle = {
			zIndex: "1060",
			height: "100%"
		};
		const modalDialogStyle = {
			zIndex: "1070",
		};

		let faultyReportMessage = null;
		if (this.state.auditStore.find_faulty_report_count > 0) {
			faultyReportMessage = (<span style={faultyReportMessageStyle} className="pull-right">{this.state.auditStore.find_faulty_report_count} Repeated Attachment Found</span>);
		}
		let auditDateElement = moment(this.state.auditStore.audit_date).format(momentDateFormat);

		let failButton, qaOkButton, unSubmitButton, submitButton;
		if (this.state.auditStore.status === "ACKNOWLEDGED") {
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">Force Submit</button>);
		}
		if (this.state.auditStore.status === "ASSIGNED" || this.state.auditStore.status === "ACKNOWLEDGED" || this.state.auditStore.status === "SUBMITTED") {
			// failButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-default pull-right">Fail</button>);
			failButton = (<Link to={`${this.props.location.pathname}/fail`}><button type="button" className="btn btn-default pull-right" style={{backgroundColor:"#d9534f",color:"white"}}>Fail</button></Link>);
		}
		if (this.state.auditStore.status === "SUBMITTED") {
			if (this.state.auditStore.user.agencyuser) {
				unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-default">
					Revert to Auditor
				</button>);
			}
			else {
				unSubmitButton = (<button onClick={this.showModal} type="button" className="btn btn-default">
					Revert to Auditor
				</button>);
			}
			qaOkButton = (<button onClick={this.qaOkButtonClicked} type="button" className="btn btn-primary">Forward to PM</button>);

			let hasAuditDateError = this.state.auditDateError ? "has-error" : "";
			let hasAuditDateSuccess = this.state.auditDateSuccess ? "has-success" : "";
			auditDateElement = (<div className={"input-group " + hasAuditDateError + hasAuditDateSuccess}>
				<span className="input-group-addon"><Calendar /></span>
				<Datetime
					inputProps={{ className: "form-control" }}
					disabled={this.state.auditDateLoading}
					timeFormat={false}
					dateFormat={momentDateFormat}
					closeOnSelect={true}
					onChange={this.auditDateChanged}
					value={this.state.auditStore.audit_date}
				/>
			</div>);
		}
		const auditorEmailLink = (<a href={`mailto:${this.state.auditStore.user.email}`}>{this.state.auditStore.user.email}</a>);

		let errorMessageElement = (<span>{this.state.errorMessage}</span>);
		let editable = this.state.auditStore && this.state.auditStore.status === "SUBMITTED";

		var storeElement = null;
		var submitStore = null;
		var selectElement = null;
		var textareaElement = null;
		var checkpointButton = null;
		var sidebarElement = null;
		let refresh_report_button;

		var check_points = this.state.auditStore.check_points;
		if (editable) {
			var check_point_row = [];
			for (let i in check_points) {
				if (check_points[i]["value"]) {
					check_point_row.push(<li key={i}><label><input type="checkbox" value={i} defaultChecked /><span>{check_points[i]["checkpoint"]}</span></label></li>);
				}
				else {
					check_point_row.push(<li key={i}><label><input type="checkbox" value={i} /><span>{check_points[i]["checkpoint"]}</span></label></li>);
				}
			}
			if (check_point_row.length != 0) {
				checkpointButton = (<button className="btn btn-danger checkpoint" onClick={this.openCheckPoint}>CheckPoints</button>);
				sidebarElement = (
					<div className="sidebar">
						<button className="btn btn-primary savebtn" onClick={this.saveCheckPoints}>Save</button>
						<a href="javascript:void(0)" className="closebtn" onClick={this.closeCheckPoint}>×</a>
						<ul>
							{check_point_row}
						</ul>
						<br />
						<br />
						<br />
						<br />
						<br />
					</div>
				);
			}
		}

		if (editable) {
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.state.auditStore.moderator_status}>
					<option value="">Select Status</option>
					<option value="MISS_IMAGE">Missing Image</option>
					<option value="MISS_AUDIO">Missing Audio</option>
					<option value="MISS_VIDEO">Missing Video</option>
					<option value="AUDITOR_NOT_RESPONDING">Auditor Not Responding</option>
					<option value="CONTRADICTION">Contradiction</option>
					<option value="NOT_SUFFICIENT_PROOFS">Not Suffiecient Proofs</option>
					<option value="DATE_TIME_MISSING">Date or Time Missing in Image</option>
					<option value="WAITING_FOR_ATTACHMENT">Waiting for Attachment from Auditor</option>
					<option value="FAULTY_REPORT">Faulty Report</option>
				</select>);
			textareaElement = (
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.state.auditStore.moderator_comment}></textarea>
			);
			refresh_report_button = <button className="btn btn-primary pull-right" onClick={this.arrangeAttachmentByProofTag}>Refresh Report</button>;
		}
		else {
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.state.auditStore.moderator_status} disabled>
					<option value="">Select Status</option>
					<option value="MISS_IMAGE">Missing Image</option>
					<option value="MISS_AUDIO">Missing Audio</option>
					<option value="MISS_VIDEO">Missing Video</option>
					<option value="AUDITOR_NOT_RESPONDING">Auditor Not Responding</option>
					<option value="CONTRADICTION">Contradiction</option>
					<option value="NOT_SUFFICIENT_PROOFS">Not Sufficient Proofs</option>
					<option value="DATE_TIME_MISSING">Date or Time Missing in Image</option>
					<option value="WAITING_FOR_ATTACHMENT">Waiting for Attachment from Auditor</option>
					<option value="FAULTY_REPORT">Faulty Report</option>
				</select>
			);

			textareaElement = (
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.state.auditStore.moderator_comment} readOnly></textarea>
			);
		}
		let auditorRatingElement;
		if (this.state.auditStore.user.profileinfo) {
			auditorRatingElement = (<tr>
				<td className="text-right">Auditor Rating:</td>
				<th>
					<StarRating rating={this.state.auditStore.user.profileinfo.avg_auditor_rating} /> (<Link to={`${this.props.location.pathname}/auditor_rate`}>change</Link>)
				</th>
			</tr>);
		}

		var proof_tag_rows = [];
		for (let i of this.state.proof_tags) {
			proof_tag_rows.push(
				<div className="col-sm-6 col-md-4" key={i.id}>
					<label style={{ fontSize: "14px", marginBottom: "10px" }}><input type="checkbox" className="revert_proof" value={i.id} style={{ verticalAlign: "bottom", width: "20px", height: "20px" }} /><span> {i.proof_tag}</span></label>
				</div>
			);
		}
		const manager_info_list = this.state.auditStore.manager_info_list;
		let mngr_cntct = "";
		if (manager_info_list && manager_info_list.length > 0) {
			const contactString = manager_info_list.map(manager => `${manager.name} (${manager.mobile})`).join(", ");
			mngr_cntct = <span><b>{contactString}</b></span>;
		}
		return (
			<div className="main">
				{/*
					<ol className="breadcrumb">
						<li><Link to="/">Audit Cycle</Link></li>
						<li><Link to={`/audit_cycle/${this.state.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.state.auditStore.audit.audit_cycle.name}</Link></li>
						<li className="active"><File/> {moment(this.state.auditStore.audit_date).format(momentDateFormat)}</li>
					</ol>
				*/}
				{checkpointButton}
				<h2 className="page-header">
					{failButton}
					{this.isTimerRunning && (
						<button type="button" className="btn btn-default pull-right" style={{ marginRight: ".5rem" }} id="timer-display">
							{this.formatTime(this.timerValue)}
						</button>
					)}
					<File /> Audit Report - {this.state.auditStore.id}
					{faultyReportMessage}
				</h2>
				<div className="row">
					{!this.state.guideline ?
						<div>
							<div className="col-md-6">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h4 className="panel-title">Audit Details</h4>
									</div>
									<table className="table table-striped">
										<tbody>
											<tr>
												<td className="text-right">Client:</td>
												<th>{this.state.auditStore.audit.audit_cycle.client.name}</th>
											</tr>
											<tr>
												<td className="text-right">Store:</td>
												<td>
													{/* <b>{this.state.auditStore.audit.store.name}</b><br /> */}
													<b>{this.state.auditStore.audit.store.name}</b> {(this.state.auditStore.audit.audit_cycle.client.id === 345 || this.state.auditStore.audit.audit_cycle.client.id === 346) && <Link to={`${this.props.location.pathname}/store_change`}><b>(change store)</b></Link>}<br />
													<small>{this.state.auditStore.audit.store.address}</small>
												</td>
											</tr>
											<tr>

												<td className="text-right">Address:</td>
												<th>{`${this.state.auditStore.audit.store.address}, ${this.state.auditStore.audit.store.city.name}`}</th>
											</tr>
											<tr>
												<td className="text-right">Type:</td>
												<th><AuditTypeLabel auditType={this.state.auditStore.audit.audit_cycle.type} /></th>
											</tr>
											<tr>
												<td className="text-right">Audit Fees:</td>
												<th>
													₹ {this.state.auditStore.earnings_per_audit || this.state.auditStore.audit.earnings_per_audit} (<Link to={`${this.props.location.pathname}/earnings_per_audit`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Reimbursement upto:</td>
												<th>
													₹ {this.state.auditStore.reimbursement || this.state.auditStore.audit.reimbursement} (<Link to={`${this.props.location.pathname}/reimbursement`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Auditor:</td>
												<td>
													{/* <AuditorNameDisplay user={this.state.auditStore.user} /> */}
													<AuditorNameDisplay user={this.state.auditStore.user} id={this.state.auditStore.id} />
													( <Envelope /> {auditorEmailLink})
												</td>
											</tr>
											<tr>
												<td className="text-right">Certification Score:</td>
												<td><b>{this.state.auditStore.user.profileinfo.certification_score ? this.state.auditStore.user.profileinfo.certification_score : "NA"}</b></td>
											</tr>
											<tr>
												<td className="text-right">Audit Date:</td>
												<th>{auditDateElement}</th>
											</tr>
											<tr>
												<td className="text-right">Status:</td>
												<th><AuditStoreStatusLabel status={this.state.auditStore.status} />&nbsp;&nbsp;{this.state.auditStore.instant_assigned ? <span><i>(Instant Assigned)</i></span> : null}&nbsp;&nbsp;{this.state.auditStore.auto_assigned ? <span><i>(Auto Assigned)</i></span> : null}</th>
											</tr>
											<tr style={this.state.auditStore.report_revert_count > 0 ? { color: "red" } : null}>
												<td className="text-right">Report Revert Count:</td>
												<th>{this.state.auditStore.report_revert_count}</th>
											</tr>
											<tr>
												<td className="text-right">Report Submission Time:</td>
												<th>{this.state.auditStore.report_submission_time ? this.formatTimewWithHourMinute(this.state.auditStore.report_submission_time) : "0 hours 0 minutes 0 seconds"}</th>
											</tr>
											<tr>
												<td className="text-right">Report Completion %:</td>
												<th>
													{this.state.auditStore.audit_store_percentage === null ? <span>---</span> :
														<div className="progress" style={{ width: "100px" }}>
															<div className="progress-bar bg-primary" role="progressbar" style={{ width: `${this.state.auditStore.audit_store_percentage}%`, backgroundColor: this.state.auditStore.audit_store_percentage === 100 ? "#28a745" : " " }} aria-valuenow={this.state.auditStore.audit_store_percentage} aria-valuemin="0" aria-valuemax="100">
																{this.state.auditStore.audit_store_percentage}%
															</div>
														</div>
													}
												</th>
											</tr>
											<tr>
												<td className="text-right">QA Report Rating:</td>
												<th>
													<AuditStoreRating rating={this.state.auditStore.qa_rating} /> (<Link to={`${this.props.location.pathname}/rate`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">QA Report Feedback:</td>
												<th>
													{this.state.auditStore.qa_rating_feedback && this.state.auditStore.qa_rating_feedback.length>0 &&  this.state.auditStore.qa_rating_feedback.join(", ")}(<Link to={`${this.props.location.pathname}/rate`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Manager Contacts:</td>
												<th>{mngr_cntct}</th>
											</tr>
											{auditorRatingElement}
										</tbody>
									</table>
									<div className="panel-footer text-right">
										{errorMessageElement}
										{submitButton}&nbsp;{unSubmitButton}&nbsp;{qaOkButton}
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="row" style={paddingStyle}>
									<div className="col-md-6">
										<label>Moderator Report Status : </label>
										{selectElement}
									</div>
									<div className="col-md-6">
										<label>Moderator Comment : </label>
										{textareaElement}
									</div>
								</div>
								<div className="row" style={paddingStyle}>
									<div className="col-md-8">
										{storeElement}
									</div>
									<div className="col-md-4">
										{submitStore}
									</div>
								</div>
								<div className="panel panel-default">
									<div className="panel-body">
										<MarkdownViewer markdown={this.state.auditStore.audit.audit_cycle.post_approval_description || ""} />
									</div>
								</div>
							</div>
						</div>
						:
						<div>
							<div className="col-md-6">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h4 className="panel-title">Audit Details</h4>
									</div>
									<table className="table table-striped">
										<tbody>
											<tr>
												<td className="text-right">Client:</td>
												<th>{this.state.auditStore.audit.audit_cycle.client.name}</th>
											</tr>
											<tr>
												<td className="text-right">Store:</td>
												<td>
													<b>{this.state.auditStore.audit.store.name}</b><br />
													<small>{this.state.auditStore.audit.store.address}</small>
												</td>
											</tr>
											<tr>

												<td className="text-right">Address:</td>
												<th>{`${this.state.auditStore.audit.store.address}, ${this.state.auditStore.audit.store.city.name}`}</th>
											</tr>
											<tr>
												<td className="text-right">Type:</td>
												<th><AuditTypeLabel auditType={this.state.auditStore.audit.audit_cycle.type} /></th>
											</tr>
											<tr>
												<td className="text-right">Audit Fees:</td>
												<th>
													₹ {this.state.auditStore.earnings_per_audit || this.state.auditStore.audit.earnings_per_audit} (<Link to={`${this.props.location.pathname}/earnings_per_audit`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Reimbursement upto:</td>
												<th>
													₹ {this.state.auditStore.reimbursement || this.state.auditStore.audit.reimbursement} (<Link to={`${this.props.location.pathname}/reimbursement`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Auditor:</td>
												<td>
													<AuditorNameDisplay user={this.state.auditStore.user} />
													( <Envelope /> {auditorEmailLink})
												</td>
											</tr>
											<tr>
												<td className="text-right">Certification Score:</td>
												<td><b>{this.state.auditStore.user.profileinfo.certification_score ? this.state.auditStore.user.profileinfo.certification_score : "NA"}</b></td>
											</tr>
											<tr>
												<td className="text-right">Audit Date:</td>
												<th>{auditDateElement}</th>
											</tr>
											<tr>
												<td className="text-right">Status:</td>
												<th><AuditStoreStatusLabel status={this.state.auditStore.status} />&nbsp;&nbsp;{this.state.auditStore.instant_assigned ? <span><i>(Instant Assigned)</i></span> : null}&nbsp;&nbsp;{this.state.auditStore.auto_assigned ? <span><i>(Auto Assigned)</i></span> : null}</th>
											</tr>
											<tr style={this.state.auditStore.report_revert_count > 0 ? { color: "red" } : null}>
												<td className="text-right">Report Revert Count:</td>
												<th>{this.state.auditStore.report_revert_count}</th>
											</tr>
											<tr>
												<td className="text-right">Report Submission Time:</td>
												<th>{this.state.auditStore.report_submission_time ? this.formatTimewWithHourMinute(this.state.auditStore.report_submission_time) : "0 hours 0 minutes 0 seconds"}</th>
											</tr>
											<tr>
												<td className="text-right">Report Completion %:</td>
												<th>
													{this.state.auditStore.audit_store_percentage === null ? <span>---</span> :
														<div className="progress" style={{ width: "100px" }}>
															<div className="progress-bar bg-primary" role="progressbar" style={{ width: `${this.state.auditStore.audit_store_percentage}%`, backgroundColor: this.state.auditStore.audit_store_percentage === 100 ? "#28a745" : " " }} aria-valuenow={this.state.auditStore.audit_store_percentage} aria-valuemin="0" aria-valuemax="100">
																{this.state.auditStore.audit_store_percentage}%
															</div>
														</div>
													}
												</th>
											</tr>
											<tr>
												<td className="text-right">QA Report Rating:</td>
												<th>
													<AuditStoreRating rating={this.state.auditStore.qa_rating} /> (<Link to={`${this.props.location.pathname}/rate`}>change</Link>)
												</th>
											</tr>
											<tr>
												<td className="text-right">Manager Contacts:</td>
												<th>{mngr_cntct}</th>
											</tr>
											{auditorRatingElement}
											{this.state.guideline && this.state.guideline ?
												<tr>
													<td className="text-right">PDF Guideline:</td>
													<th><button className="btn btn-primary sm" onClick={this.openPDFInNewTab}>Open Guideline</button></th>
												</tr>
												: null}
										</tbody>
									</table>
									<div className="panel-footer text-right">
										{errorMessageElement}
										{submitButton}&nbsp;{unSubmitButton}&nbsp;{qaOkButton}
									</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="row" style={paddingStyle}>
									<div className="col-md-6">
										<label>Moderator Report Status : </label>
										{selectElement}
									</div>
									<div className="col-md-6">
										<label>Moderator Comment : </label>
										{textareaElement}
									</div>
								</div>
							</div>
						</div>
					}
					<div className="col-md-12">
						<td className="text-right" style={{ fontSize: "16px", paddingLeft: "10px" }}><b> Audit Notes :-</b></td>
						{(this.state.auditStore.audit.post_approval_description) ?
							<div className="panel-body" style={{ marginTop: "-20px" }}>
								<MarkdownViewer markdown={this.state.auditStore.audit.post_approval_description || ""} />
							</div>
							: null}
					</div>
				</div>

				{refresh_report_button}
				<MandatoryProofBox auditStoreId={this.props.params.auditStoreId} auditStore={this.state.auditStore} editable={editable} onReload={this.handleMandatoryProofReload} sectionproof_change={this.state.sectionproof_change}/>
				<AttachmentBox auditStoreId={this.props.params.auditStoreId} auditStore={this.state.auditStore} editable={editable} />
				{this.state.proof_not_available.length > 0 && <ProofNotAvailable proof_not_available={this.state.proof_not_available} />}
				{/* <ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={editable} reportSummary={this.state.auditStore.report_summary} /> */}
				{this.state.auditStore.audit.audit_cycle.audit_report_summary ?
					<ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={editable} reportSummary={this.state.auditStore.report_summary} />
					: null}
				<AuditStoreSections
					// key={this.state.reloadKey} // to force remount when mandatoryproofbox changes
					handleSectionProofChange={this.handleSectionProofChange}
					auditStoreId={parseInt(this.props.params.auditStoreId)} auditStore={this.state.auditStore} />
				{this.props.children}

				{sidebarElement}

				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal} />
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideModal}>&times;</button>
								<h4 className="modal-title">Revert To Auditor</h4>
							</div>
							<div className="modal-body">
								Please Enter reason for reverting the audit to auditor
								<textarea rows="5" className="form-control" value={this.state.reason} onChange={this.reasonChanged} onBlur={this.onBlur} />
								<span style={{ color: "red" }}>{this.state.errMsg}</span>
								{proof_tag_rows.length > 0 ?
									<div>
										<br />
										<p><b>Select missing proofs</b></p><hr />
										<div className="row revert_tags">
											{proof_tag_rows}
										</div>
									</div>
									: null}
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-primary" onClick={this.submit_hideModal}>Submit</button>
								<button type="button" className="btn btn-default" onClick={this.hideModal}>Close</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
