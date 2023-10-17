import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import Select from "react-select";
import { url }  from "../../../../config.js";

import { fetchAuditStore, submitReportActionPlan, getReportActionPlan, submitAuditStorePDFReport } from "../../service/audit_store.js";
import { fetchSections } from "../../service/section.js";
import { fetchReportSections } from "../../service/report_section.js";
import { findImpactFactorsByAuditStore } from "../../service/impact_factor";

import { File, Print, Download, Comment, Plus, Cross, Envelope } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import Alert from "react-s-alert";

import AuditStoreDetailsBox from "./AuditStoreDetailsBox.jsx";
import SectionList from "./SectionList.jsx";
import SectionTotalsBox from "./SectionTotalsBox.jsx";
import ActionReportBox from "./ActionReportBox.jsx";
import AttachmentPrintRenderer from "./AttachmentPrintRenderer.jsx";
import OverallExperienceGauge from "./OverallExperienceGauge.jsx";
import ImpactFactorBox from "./ImpactFactorBox.jsx";

import floorwalkLogoUrl from "../../../../img/logo_500x300.png";
import { fetchUser,findAllClientUser } from "../../service/user.js";

export default class AuditStoreDetail extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		printMode: PropTypes.bool,
		route: PropTypes.shape({
			printMode: PropTypes.bool,
		}),
		location:PropTypes.object
	};

	static defaultProps = {
		printMode: false,
		route: {
			printMode: false,
		},
	};

	state = {
		auditStore: null,
		sections: [],
		reportSections: [],
		actionPlan: [],
		display: "none",
		errMsg: "",
		action_plan: "",
		target_date: "",
		person: "",
		loading_modal: false,
		emailInputList: [""],
		report_display: "none",
		reportErrMsg: "",
	};

	componentDidMount() {
		fetchUser().then((clientUser)=>{
			this.setState({
				clientUser
			});
			if( this.props.location.pathname === "/"){
				hashHistory.push("/dashboard");
			}
		});
		fetchAuditStore(this.props.params.auditStoreId).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
		fetchSections(this.props.params.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
		fetchReportSections(this.props.params.auditStoreId).then((reportSections) => {
			this.setState({
				reportSections
			});
		});
		findImpactFactorsByAuditStore(this.props.params.auditStoreId).then((impactFactors) => {
			this.setState({
				impactFactors
			});
		});
		findAllClientUser(this.props.params.auditStoreId).then((allResponsibleUser)=>{
			this.setState({
				allResponsibleUser
			});
		});
		this.getReportActionPlanList();
	}

	getReportActionPlanList = () =>{
		getReportActionPlan(this.props.params.auditStoreId).then((actionPlan) => {
			this.setState({
				actionPlan
			});
		});
	};

	showModal = () => {
		this.setState({
			display:"block",
			loading_modal: false
		});

	};

	hideModal = () => {
		this.setState({ display:"none", errMsg: "" });
	};
	submit_hideModal = () => {
		let action_plan = this.state.action_plan;
		let target_date = this.state.target_date;
		let person = this.state.person.value;
		if (action_plan === ""){
			this.setState({errMsg: "Please enter Action Plan"});
		}
		else if(target_date === ""){
			this.setState({errMsg: "Please enter valid Target Date"});
		}
		else if(person === ""){
			this.setState({errMsg: "Please enter Person Responsible"});
		}
		else{
			this.setState({
				loading_modal: true
			});
			submitReportActionPlan(this.props.params.auditStoreId, action_plan, target_date, person).then(() => {
				this.getReportActionPlanList();
				this.setState({
					display:"none",
					errMsg: "",
					action_plan: "",
					target_date: "",
					person: "",
					loading_modal: false
				});
				Alert.success("ACTION PLAN SUBMITTED");
			});
		}
	};

	validation = (currentDate) => {
		var yesterday = moment().subtract( 1, "day" );
		return currentDate.isAfter(yesterday);
	};

	dateChanged = (date) => {
		if(typeof date !== "string"){
			this.setState({
				target_date: date.format("YYYY-MM-DD"),
				errMsg: ""
			});
		}
		else{
			this.setState({
				target_date: ""
			});
		}
	};

	actionPlanChanged = (e) =>{
		this.setState({
			action_plan: e.target.value,
			errMsg: ""
		});
	};

	personChanged = (person) =>{
		this.setState({ person });
	};

	// showReportModal = () => {
	// 	this.setState({
	// 		report_display:"block"
	// 	});
	// };

	hideReportModal = () => {
		this.setState({ report_display:"none", reportErrMsg: "" });
	};

	// handle click event of the Remove button
	handleRemoveClick = index => {
		this.setState({
			emailInputList: this.state.emailInputList.filter((val,ind) => ind !== index)
		});
	};

	// handle click event of the Add button
	handleAddClick = () => {
		this.setState(prevState => ({ emailInputList: [...prevState.emailInputList, ""]}));
	};

	// handle input change
	handleInputChange = (e, index) => {
		let emaillist = this.state.emailInputList;
		emaillist[index] = e.target.value;
		this.setState({
			emailInputList: emaillist,
		});
	};

	submit_Send_Mail_Modal = (e) =>{
		e.preventDefault();
		let email_receiver_list = [];
		for(let email of this.state.emailInputList){
			if(email != "" && typeof email !== "undefined" && email !== null){
				email_receiver_list.push(email);
			}
		}
		if(email_receiver_list.length == 0){
			this.setState({
				reportErrMsg: "Please enter a email",
			});
		}
		else{
			this.hideReportModal();

			this.setState({
				report_display: "none",
				loading_modal: true
			});

			// Generate audit report html from queryselector
			let audit_report = document.querySelector(".audit_report");
			if(audit_report != ""){
				audit_report = audit_report.innerHTML;
				submitAuditStorePDFReport(email_receiver_list, this.props.params.auditStoreId, audit_report).then(()=>{
					Alert.success("Report is mailed");
				});
			}
		}
	};

	render() {
		let options=[];
		if(this.state.allResponsibleUser){
			for (let s of this.state.allResponsibleUser){
				options.push({
					label: `${s.full_name} -- ${s.email}`,
					value: s.email
				});
			}
		}
		if(! this.state.auditStore){
			return <Loading/>;
		}
		const printMode = this.props.printMode || this.props.route.printMode || false;

		let imgUrl = this.state.clientUser && this.state.clientUser.client && this.state.clientUser.client.logo_url ?  this.state.clientUser.client.logo_url : floorwalkLogoUrl;

		const reportmodalStyle = {
			display: this.state.report_display,
			overflow: "scroll"
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
		let submit_button_html;
		if(!this.state.loading_modal){
			submit_button_html = (
				<div className="modal-footer">
					<span style={{color:"red"}}>{this.state.errMsg}</span>&nbsp;&nbsp;&nbsp;
					<button type="button" className="btn btn-primary" onClick={this.submit_hideModal}>Submit</button><button type="button" className="btn btn-default" onClick={this.hideModal}>Close</button>
				</div>
			);
		}
		else{
			submit_button_html = (<Loading/>);
		}
		return (
			<div className="audit_report">
				<h2 className="page-header">
					{ printMode ?
						<button className="btn btn-default pull-right hidden-print" onClick={window.print}>
							<Print/> Print Report
						</button>
						:
						<a className="btn btn-default pull-right hidden-print" href={`report_print.html#/${this.props.params.auditStoreId}`} target="_blank" rel="noopener noreferrer">
							<Print/> Print Report
						</a>
					}
					{/* { ! printMode ? <button className="btn btn-default pull-right hidden-print" onClick={this.showReportModal}>
						<Envelope/> Send PDF Report
					</button> : "" } */}
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + "client/audit_store/" + this.state.auditStore.id + "/ears_report"}>
						<Download/> E.A.R.S Report
					</a> : ""}
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + "client/audit_store/" + this.state.auditStore.id + "/xlsx_report"}>
						<Download/> Excel Report
					</a> : ""}
					{ ! printMode ? <button className="btn btn-default pull-right hidden-print" onClick={this.showModal}>
						<Comment/> Write Action Plan
					</button> : ""}
					<File/> Audit Report
				</h2>
				<div className="row">
					<div className="col-md-6">
						{ printMode || this.state.report_display == "block" ?
							<div className="watermark">
								<img src={imgUrl} height="250" width="300" />
							</div>
							:
							null
						}
						<AuditStoreDetailsBox auditStore={this.state.auditStore}/>
					</div>
					<div className="col-md-6">
						<OverallExperienceGauge colorCode={this.state.auditStore.color} value={this.state.auditStore.audit_store_percentage}/>
					</div>
				</div>
				{ this.state.impactFactors && this.state.impactFactors.length > 0 ?
					<ImpactFactorBox impactFactors={this.state.impactFactors}/> : null
				}
				<ActionReportBox actionPlan={this.state.actionPlan}/>
				<SectionTotalsBox sections={this.state.sections} reportSections={this.state.reportSections}/>
				<SectionList auditStoreId={parseInt(this.props.params.auditStoreId)} sections={this.state.sections} reportSections={this.state.reportSections} printMode={printMode || this.state.report_display == "block"}/>
				{ printMode ?
					<AttachmentPrintRenderer auditStoreId={parseInt(this.props.params.auditStoreId)} sections={this.state.sections}/>
					: null }
				{ this.state.report_display == "block" ?
					<div className="text-center" style={{marginTop:"2%"}}>
						<img src={imgUrl} height="60" width="120" />
					</div>
					: null }
				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal}/>
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideModal}>&times;</button>
								<h4 className="modal-title">Create a Action Plan</h4>
							</div>
							<div className="modal-body">
								<div className="col-sm-12">
									<label>Action Plan:</label>
									<textarea rows="5" className="form-control" value={this.state.action_plan} onChange={this.actionPlanChanged} />
								</div>
								<div className="col-sm-12">
									<label>Target Date:</label>
									<Datetime
										timeFormat={false}
										dateFormat="YYYY-MM-DD"
										closeOnSelect={true}
										value={this.state.target_date}
										onChange={this.dateChanged}
										isValidDate={this.validation}
									/>
								</div>
								<div className="col-sm-12">
									<label>Person Responsible:</label>
									<Select
										value={this.state.person} //selectedOption
										onChange={this.personChanged}
										options={options}
										placeholder="Select Peson"
									/>
								</div>
							</div>
							{submit_button_html}
						</div>
					</div>
				</div>

				<div className="modal" id="audit_report_model" tabIndex="-1" style={reportmodalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideReportModal}/>
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideReportModal}>&times;</button>
								<h4 className="modal-title">Send Audit Report</h4>
							</div>
							<div className="modal-body">
								<form method="POST">
									<p className="text-danger">{this.state.reportErrMsg}</p>
									{this.state.emailInputList.map((x, i) => {
										return (
											<div className="form-inline" style={{marginBottom:"2%"}} key={i}>
												<input
													type="email"
													name="email"
													key={i}
													value={x}
													placeholder="Enter email"
													onChange={e=> this.handleInputChange(e, i)}
													className="form-control"
													style={{marginRight:"2%"}}
												/>
												{this.state.emailInputList.length-1 !== i && this.state.emailInputList.length !== 1 && <button type="button" className="btn btn-sm btn-default" onClick={() => this.handleRemoveClick(i)}><Cross /></button>}
												{this.state.emailInputList.length - 1 === i && <button type="button" className="btn btn-sm btn-default" onClick={this.handleAddClick}><Plus /></button>}
											</div>
										);
									})}
									<button type="submit" className="btn btn-primary" onClick={this.submit_Send_Mail_Modal}>Submit</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
