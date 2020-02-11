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

import { auditPropType, auditCyclePropType, applicationPropType } from "../prop_types";

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

	render(){
		let button, auditDate, textLabel;
		if( typeof this.props.application === "undefined" || this.props.application.status === "NOT_APPLIED"){
			button = <button type="button" className="btn btn-primary" onClick={this.applyButtonClicked}><ShareAlt/> Apply</button>;
			//<Link to={applyLink} className="btn btn-primary"><ShareAlt/> Apply</Link>;
			//button = applyButton;
			//textLabel = <ApplicationStatusLabel status="NOT_APPLIED"/>;
		}
		else if( this.props.application.status === "APPLIED" || this.props.application.status === "WAITLISTED"){
			let cancelLink = `/audit/cycle/${this.props.audit.audit_cycle.id}/audit/${this.props.audit.id}/cancel`;
			let cancelButton = <Link to={cancelLink} className="btn btn-sm btn-default" title="Cancel Application"><Cross/> Cancel</Link>;
			if(this.props.application.status === "APPLIED"){
				auditDate = <p>You have <b className="text-info">applied</b> for an audit on <b>{moment(this.props.application.audit_date).format(momentDateFormat)}</b>. It is pending for approval.<br/><small><b className="text-danger">NOTE: DO NOT CONDUCT THE AUDIT UNTIL YOUR APPLICATION IS APPROVED.</b></small></p>;
			}

			if(this.props.application.status === "WAITLISTED"){
				auditDate = <p>Your application is on <b className="text-warning">wait list</b>. There is a good chance that it may get approved.<br/><small><b className="text-danger">NOTE: DO NOT CONDUCT THE AUDIT UNTIL YOUR APPLICATION IS APPROVED.</b></small></p>;
			}

			button = cancelButton;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		}
		else if( this.props.application.status === "APPROVED"){
			auditDate =  <span>Your <b className="text-success">approved</b> audit date is <b>{moment(this.props.application.audit_date).format(momentDateFormat)}</b>. Don&#39;t forget to conduct the audit!</span>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} else {
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		}
		let fees = this.props.audit.earnings_per_audit ? <span>Flat: <big><b>₹ {this.props.audit.earnings_per_audit}</b></big>, </span> : "";
		let reimb = this.props.audit.reimbursement ? <span>Reimbursement upto: <big><b>₹ {this.props.audit.reimbursement}</b></big></span> : "";

		return (
			<div className="row">
				<div className="col-sm-4">
					<label className="hidden-sm hidden-md hidden-lg">Store Location</label>
					<p><b><big>{this.props.audit.store.name}, {this.props.audit.store.city.name}</big></b></p>
					<p><b>{this.props.audit.store.address}</b></p>
				</div>
				<div className="col-sm-4">
					<label className="hidden-sm hidden-md hidden-lg">Earnings</label>
					<p>{fees}{reimb}</p>
				</div>
				<div className="col-sm-4">
					<p>
						{textLabel ? <b>{textLabel}</b> : null}&nbsp;{button}
					</p>
				</div>
				{ auditDate ?
					<div className="col-xs-12 col-sm-4 col-sm-offset-8">
						{auditDate}
					</div>
					: null}
				<div className="col-xs-12"><hr/></div>
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
		applications: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
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
	close_div = () => {
		$(".assignment_info").hide();
	};
	componentDidMount() {
		this.reloadAudits(100);
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	}
	render(){
		if(this.state.loading || !this.props.auditCycle){
			return <Loading/>;
		}

		let rows = [];
		for(var id in this.props.audits) {
			let application;
			for( let appId in this.props.applications){
				if( this.props.applications[appId].audit === Number(id)){
					application = this.props.applications[appId];
					break;
				}
			}
			rows.push(<AuditRow audit={this.props.audits[id]} application={application} key={id}/>);
		}

		let flexCenter = {display: "flex", justifyContent: "center", alignItems: "center", height:"170px"};
		//let flexLeft = {display: "flex", justifyContent: "left", alignItems: "center"};
		let labelStyle = {fontSize: "1.2em"};
		let valueStyle = {fontSize: "1.5em"};
		return (
			<div>
				<div className="jumbotron assignment_info" style={{paddingTop:"10px",paddingBottom:"10px",paddingRight:"30px",paddingLeft:"30px"}}>
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
							<div className="col-sm-4">
								<p>
									<span className="text-muted" style={labelStyle}>Start Date</span><br/>
									<span style={valueStyle}><b>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</b></span>
								</p>
							</div>
							<div className="col-sm-4">
								<p>
									<span style={labelStyle} className="text-muted">End Date</span><br/>
									<span style={valueStyle}><b>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</b></span>
									{/*
						<table className="table table-bordered">
							<tbody>
								<tr>
									<td className="text-right">Type</td>
									<td><b><AuditTypeLabel auditType={this.props.auditCycle.type}/></b></td>
								</tr>
								<tr>
									<td className="text-right">Start Date</td>
									<td>
									<b>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</b>
									</td>
								</tr>
								<tr>
									<td className="text-right">End Date</td>
									<td>
									<b>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</b>
									</td>
								</tr>
							</tbody>
						</table>
						*/}
								</p>
							</div>
							<div className="col-sm-12">
								<p style={{fontSize:"1.2em"}}>{this.props.auditCycle.description}</p>
							</div>
						</div>
					</div>
				</div>
				<h3 className="page-header hidden-sm hidden-md hidden-lg">Audit Locations</h3>
				<div className="row hidden-xs">
					<div className="col-sm-4"><big><b>Store Location</b></big></div>
					<div className="col-sm-4"><big><b>Earnings</b></big></div>
					<div className="col-sm-4"><big><b>Status</b></big></div>
					<div className="col-xs-12"><hr/></div>
				</div>
				{rows}
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
		auditCycle: (function(audits){
			for(let id in audits){
				if(audits[id].audit_cycle.id === parseInt(ownProps.params.auditCycleId)){
					return audits[id].audit_cycle;
				}
			}
			return null;
		})(store.audits),
		applications: store.applications
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList);
