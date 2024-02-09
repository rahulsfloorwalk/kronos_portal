import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link, hashHistory } from "react-router";
import $ from "jquery";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchApplications } from "../actions/application.js";
import { fetchAudits } from "../actions/audit.js";
import { fetchProfileInfo } from "../actions/profile_info.js";

import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import { Cross, ShareAlt } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";
import { fetchPreferences } from "../service/preferences.js";
import { getGender,getIncomeText,getCarCost,getEducationStatus,getReportRating,getMaritalStatus,getAuditorRating } from "../../utils.js";
import { auditPropType, auditCyclePropType, applicationPropType } from "../prop_types";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import "../../../css/bs_overrides.scss";

class AuditRow extends React.Component{
	static propTypes = {
		audit: auditPropType,
		application: applicationPropType,
	};

	applyButtonClicked = () => {
		fetchPreferences().then((prefs) => {
			if(!prefs.pp_accepted || !prefs.agreement_accepted){
				hashHistory.push(`/tos_accept?auditCycleId=${this.props.audit.audit_cycle.id}&auditId=${this.props.audit.id}`);
			} else {
				hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}/audit/${this.props.audit.id}/apply`);
			}
		});
	};

	FillReportClicked=()=>{
		hashHistory.push("/audit_store");
	};
	render(){
		let button, auditDate, textLabel,redirectButton;
		if( typeof this.props.application === "undefined" || this.props.application.status === "NOT_APPLIED"){
			button = <button type="button" className="btn btn-primary btn-lg btn-block" style={{ borderColor: "bule", borderRadius: "0px 0px 3px 3px"}} onClick={this.applyButtonClicked}><ShareAlt/> Apply</button>;
		}
		else if( this.props.application.status === "APPLIED" || this.props.application.status === "WAITLISTED"){
			let cancelLink = `/audit/cycle/${this.props.audit.audit_cycle.id}/audit/${this.props.audit.id}/cancel`;
			let cancelButton =
			<div style={{paddingBottom:"0.5rem",paddingTop: "0.5rem"}}>
				<Link to={cancelLink} className="btn btn-sm btn-default" title="Cancel Application"><Cross/> Cancel</Link>
			</div>;
			if(this.props.application.status === "APPLIED"){
				auditDate = <p>You have <b className="text-info">applied</b> for an audit on <b>{moment(this.props.application.audit_date).format(momentDateFormat)}</b>. It is pending for approval.<br/><small><b className="text-danger">NOTE: DO NOT CONDUCT THE AUDIT UNTIL YOUR APPLICATION IS APPROVED.</b></small></p>;
			}

			if(this.props.application.status === "WAITLISTED"){
				auditDate = <p >Your application is on <b className="text-warning">wait list</b>. There is a good chance that it may get approved.<br/><small><b className="text-danger">NOTE: DO NOT CONDUCT THE AUDIT UNTIL YOUR APPLICATION IS APPROVED.</b></small></p>;
			}

			button = cancelButton;
			textLabel = <div style={{paddingBottom:"0.5rem",paddingTop: "0.5rem"}}><ApplicationStatusLabel status={this.props.application.status}/></div> ;
		}
		else if( this.props.application.status === "APPROVED"){
			redirectButton = <div style={{paddingTop: "0.5rem"}}><button type="button" className="btn btn-primary" onClick={this.FillReportClicked} >Fill Report</button></div>;
			// redirectButton = <button type="button" className="btn btn-primary" onClick={this.FillReportClicked} >Fill Report</button>;
			auditDate =  <span> <br /> Your <b className="text-success" >approved</b> audit date is <b>{moment(this.props.application.audit_date).format(momentDateFormat)}</b>. Don&#39;t forget to conduct the audit!</span>;
			textLabel = <div style={{paddingTop: "0.5rem"}}><ApplicationStatusLabel status={this.props.application.status}/></div>;
		}
		else if( this.props.application.status === "WITHDRAWN"){
			auditDate =  <span>Your Audit Application has <b className="text-default">Withdrawn</b>. <br/>You Can Re-Apply by clicking  apply button.<br/><small><b className="text-danger">NOTE: DO NOT CONDUCT THE AUDIT.</b></small></span>;
			button = <button type="button" className="btn btn-primary" onClick={this.applyButtonClicked}><ShareAlt/> Apply</button>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} else {
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		}
		let fees = this.props.audit.earnings_per_audit ? <span>Flat: <big><b>₹ {this.props.audit.earnings_per_audit}</b></big>, </span> : "";
		let reimb = this.props.audit.reimbursement ? <span>Reimbursement upto: <big><b>₹ {this.props.audit.reimbursement}</b></big></span> : "";
		return (
			// <div className="row">
			// 	<div className="col-sm-3">
			// 		<label className="hidden-sm hidden-md hidden-lg">Store Name</label>
			// 		<p><big>{this.props.audit.store.name}, {this.props.audit.store.city.name}</big></p>
			// 		<p>{this.props.audit.store.address}</p>
			// 	</div>
			// 	<div className="col-sm-3">
			// 		<label className="hidden-sm hidden-md hidden-lg">Earnings</label>
			// 		<p>{fees}{reimb}</p>
			// 	</div>
			// 	<div className="col-sm-3">
			// 		<p>
			// 			{textLabel ? <b>{textLabel}</b> : null}&nbsp;{button}&nbsp;&nbsp;{redirectButton}
			// 		</p>
			// 	</div>
			// 	{ auditDate ?
			// 		<div className="col-xs-12 col-sm-4 col-sm-offset-8">
			// 			{auditDate}
			// 		</div>
			// 		: null}
			// 	<div className="col-xs-12"><hr/></div>
			// </div>
			<div className="panel panel-default" style={{ width: "100%", margin: "auto" }}>
				<table className="table" style={{ width: "100%" }}>
					<colgroup>
						<col style={{ width: "27%" }} />
						<col style={{ width: "73%" }} />
					</colgroup>
					<tbody>
						<tr className="even-row">
							<td className="text-left" style={{ border: "none",borderRadius: "5px"  }}>Store Name:</td>
							<td style={{ border: "none",borderRadius: "5px" }}>
								<b>
									<p><big>{this.props.audit.store.name}, {this.props.audit.store.city.name}</big></p>
									<p>{this.props.audit.store.address}</p>
								</b>
							</td>
						</tr>
						<tr className="odd-row">
							<td className="text-left">Earnings:</td>
							<td className="truncateStyle1"><p>{fees}{reimb}</p></td>
						</tr>
						<tr className="even-row">
							<td className="text-left" colSpan="2" style={{ whiteSpace: "pre-wrap" }}>
								{/* <p>{this.props.application && auditDate ? auditDate : "You have not applied"}</p> */}
								<p>
									{this.props.application && auditDate ? auditDate : (
										<small><b className="text-danger"> <br /> NOTE: PLEASE CHECK ELIGIBILITY BEFORE APPLY.</b> <br /> </small>
									)}
								</p>
							</td>
						</tr>
					</tbody>
				</table>

				<div style={{ display: "flex", justifyContent: "center",borderRadius: "3px"}} className="odd-row">
					{textLabel && (
						<b className="" style={{ fontSize: "15px", textAlign: "center", marginRight: "5px", marginTop: "4px",}}>
							{textLabel}
						</b>
					)}
					{button}
					<div style={{paddingBottom:"0.5rem"}}>
						{redirectButton}
					</div>
				</div>
			</div>
		);
	}
}

class AuditList extends Component{
	static propTypes = {
		children: PropTypes.node,
		dispatch: PropTypes.func.isRequired,
		auditCycle: auditCyclePropType,
		audits: PropTypes.object,
		travel_audits: PropTypes.object,
		applications: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			audit_alignment_factors:"",
		};
	}
	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};
	reloadAudits = (kms) => {
		this.setLoading(true);
		this.props.dispatch(fetchAudits({
			kms,
		})).always(()=>{
			this.setLoading(false);
		});
	};
	open_div = () =>{
		$(".assignment_process_button").hide();
		$(".assignment_info").show();
	};
	close_div = () => {
		$(".assignment_info").hide();
		$(".assignment_process_button").show();
	};
	componentDidMount() {
		this.reloadAudits(100);
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			const audit_alignment_factors = nextProps.auditCycle.audit_alignment_factors.map(factor => {
				let value = "";
				if (Array.isArray(factor.value) && factor.value.length > 0) {
					switch(factor.key) {
					case "gender":
						value = factor.value.map(getGender).join(", ");
						break;
					case "education":
						value = factor.value.map(getEducationStatus).join(", ");
						break;
					case "income":
						value = factor.value.map(getIncomeText).join(", ");
						break;
					case "car_cost":
						value = factor.value.map(getCarCost).join(", ");
						break;
					case "marital_status":
						value = factor.value.map(getMaritalStatus).join(", ");
						break;
					case "auditor_rating":
						value = factor.value.map(getAuditorRating).join(", ");
						break;
					case "report_rating":
						value = factor.value.map(getReportRating).join(", ");
						break;
					default:
						value = factor.value.join(", ");
					}
				} else if (typeof (factor.value) === "string" && factor.value.trim() !== "") {
					value = factor.value;
				}
				const key = factor.key.charAt(0).toUpperCase() + factor.key.slice(1);
				// const key = factor.key.replace(/_/g, ' ').replace(/\b\w/g, firstChar => firstChar.toUpperCase());
				// const spacedKey = '\u00A0\u00A0 ' + key.replace(/_/g, ' ');
				return value ? `${key}: ${value}` : null;
			}).filter(Boolean).join(", ");
			this.setState({
				audit_alignment_factors
			});
		}
	}

	render(){
		if(this.state.loading || !this.props.auditCycle){
			return <Loading/>;
		}

		let rows = [];
		let audit_list = Object.assign({}, this.props.audits, this.props.travel_audits);
		for(var id in audit_list) {
			let application;
			for( let appId in this.props.applications){
				if( this.props.applications[appId].audit === Number(id)){
					application = this.props.applications[appId];
					break;
				}
			}
			rows.push(<AuditRow audit={audit_list[id]}  application={application} key={id}/>);
		}

		let flexCenter = {display: "flex", justifyContent: "center", alignItems: "center", height:"170px"};
		//let flexLeft = {display: "flex", justifyContent: "left", alignItems: "center"};
		let labelStyle = {fontSize: "1.2em"};
		let valueStyle = {fontSize: "1.5em"};
		let eligibilityStyle = {fontSize: "1.5rem"};
		const support_button = this.props.auditCycle.support_page_link ? <a href={this.props.auditCycle.support_page_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><span style={{animation: "blink 1s linear infinite",fontWeight:"bold"}}>Need support for {this.props.auditCycle.client.auditor_display_name}?</span></a> : null;
		return (
			<div>
				<div className="row pull-right">
					{support_button}&nbsp;&nbsp;
					<button className="btn btn-success assignment_process_button" onClick={this.open_div}>Read audit assignment process</button>
				</div>
				<div className="jumbotron assignment_info" style={{paddingTop:"10px",paddingBottom:"10px",paddingRight:"30px",paddingLeft:"30px",display:"none"}}>
					<button className="btn pull-right" onClick={this.close_div}><u>Close(x)</u></button>
					<br/>
					<h3 style={{textAlign:"center"}}>About audit assignment process</h3>
					<p style={{fontSize:"16px"}}>The audits are assigned basis on right auditor profile match and time of audit application. It is an automated process and happens via system. Only applications applied from the portal are considered for assignment.</p>
					<p style={{fontSize:"16px"}}><b>Tips for getting audit approved:</b></p>
					<p style={{fontSize:"14px"}}>
						1. Kindly <b>complete your detailed profile</b> with ID proofs to increase chances of audit assignment<br/>
						2. Keep <b>checking the portal</b> for new opportunities<br/>
						3. <b>Apply for the opportunities</b> as soon as they are live on the portal
					</p>
				</div>

				<h2 className="page-header">
					<Link className="btn btn-default btn-lg" to="/audit"><b>↲</b></Link> <b>{this.props.auditCycle.client.auditor_display_name}</b> Audits
				</h2>
				<div className="row">
					<div className="col-sm-3" style={flexCenter}>
						<img style={{boxSizing: "border-box",maxWidth:"100%",maxHeight:"100%",padding:"10px"}}
							src={this.props.auditCycle.client.auditor_logo_url} alt="client logo"
							title={this.props.auditCycle.client.auditor_display_name}/>
					</div>
					<div className="col-sm-9">
						<div className="row">
							<div className="col-sm-4">
								<p>
									<span className="text-muted" style={labelStyle}>Type</span><br/>
									<span style={valueStyle}><b><AuditTypeLabel auditType={this.props.auditCycle.type}/></b></span>
								</p>
							</div>
							<div className="col-sm-8">
								<p>
									<span style={labelStyle} className="text-muted">Eligibility</span><br/>
									{/* <span style={valueStyle}><b>{this.state.eligibility ? this.state.eligibility : "N/A" }</b></span> */}
									{/* <span style={eligibilityStyle}>{this.state.audit_alignment_factors ? this.state.audit_alignment_factors : "N/A" }</span> */}
									{/* <span style={eligibilityStyle}>{this.state.audit_alignment_factors? this.state.audit_alignment_factors.split(/(\b\w+:)/g).map((part, index) =>	index % 2 === 1 ? <span style={{ fontWeight: "bold" }}>{part}</span> : part	): "N/A"}</span> */}
									<span style={eligibilityStyle}>{this.state.audit_alignment_factors
										? this.state.audit_alignment_factors
											.split(/(\b\w+:)/g)
											.map((part, index) => {
												if (index % 2 === 1 && part.includes("_")) {
													part = part.replace(/_/g, " ");
													return <span style={{ fontWeight: "bold" }}>{part}</span>;
												} else if (index % 2 === 1) {
													const containsOnlyOneWord = /^\w+$/.test(part.trim());
													return containsOnlyOneWord ? part : <span style={{ fontWeight: "bold" }}>{part}</span>;
												}
												return part;
											})
										: "N/A"}
									</span>

								</p>
							</div>
							<div className="col-sm-12">
								{/* <p style={{fontSize:"1.2em"}}>{this.props.auditCycle.description}</p> */}
								<MarkdownViewer markdown={this.props.auditCycle.description || ""}/>
							</div>
						</div>
					</div>
				</div>
				<h3 className="page-header hidden-sm hidden-md hidden-xs">Audit Locations :</h3>
				{/* <div className="row hidden-xs">
					<div className="col-sm-3"><big><b>Store Name</b></big></div>
					<div className="col-sm-3"><big><b>Earnings</b></big></div>
					<div className="col-sm-3"><big><b>Status</b></big></div>
					<div className="col-xs-12"><hr/></div>
				</div> */}
				{/* {rows}
				{this.props.children} */}

				<div className="audit_list_detail_row" style={{ display: "flex", flexWrap: "wrap", }}>
					{rows.map((row, index) => (
						<div key={index} className="audit_list_detail_box">
							{row}
						</div>
					))}
				</div>
				{this.props.children}

			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		audits: (function(audits){
			let filteredAudits = {};
			for(let id in audits){
				if(audits[id].audit_cycle.id === parseInt(ownProps.params.auditCycleId)){
					filteredAudits[id] = audits[id];
				}
			}
			return filteredAudits;
		})(store.audits),
		auditCycle: (function(audits, travel_audits){
			for(let id in audits){
				if(audits[id].audit_cycle.id === parseInt(ownProps.params.auditCycleId)){
					return audits[id].audit_cycle;
				}
			}
			for(let id in travel_audits){
				if(travel_audits[id].audit_cycle.id === parseInt(ownProps.params.auditCycleId)){
					return travel_audits[id].audit_cycle;
				}
			}
			return null;
		})(store.audits, store.travel_audits),
		applications: store.applications,
		travel_audits: (function(travel_audits){
			let filteredAudits = {};
			for(let id in travel_audits){
				if(travel_audits[id].audit_cycle.id === parseInt(ownProps.params.auditCycleId)){
					filteredAudits[id] = travel_audits[id];
				}
			}
			return filteredAudits;
		})(store.travel_audits),
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList);
