import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";
import $ from "jquery";

import moment from "moment";
import { affectInputEventToComponent } from "../../react_utils.js";


import "../../../css/bs_overrides.scss";
import { fetchApplications } from "../actions/application.js";
import { fetchAudits, fetchTravelAudits } from "../actions/audit.js";
import { fetchProfileInfo } from "../actions/profile_info.js";

import MoreAuditBox from "./MoreAuditBox.jsx";
import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import Loading from "../../components/Loading.jsx";

import { auditCyclePropType } from "../prop_types";

class AuditCycleRow extends Component{
	static propTypes = {
		audit_cycle: auditCyclePropType,
		fees: PropTypes.number,
		reimbursement: PropTypes.number,
		count: PropTypes.number,
	};
	constructor(props){
		super(props);
		this.state = {};
	}
	render(){
		let viewLink = `/audit/cycle/${this.props.audit_cycle.id}`;
		let maxImageHeight = "170px";
		let mediaImgStyle = {
			boxSizing: "border-box",
			padding:"10px",
			maxWidth: "100%",
			maxHeight: maxImageHeight,

			position: "relative",
			top:"85px",
			transform: "translateY(-50%)",
		};
		return (
			<div className="panel panel-default">
				<div style={{textAlign: "center", height: maxImageHeight}}>
					<Link to={viewLink}>
						<img style={mediaImgStyle} src={this.props.audit_cycle.client.auditor_logo_url} alt="client logo" title={this.props.audit_cycle.client.auditor_display_name}/>
					</Link>
				</div>
				<table className="table table-striped">
					<colgroup>
						<col style={{width:"30%"}}/>
						<col style={{width:"70%"}}/>
					</colgroup>
					<tbody>
						<tr>
							<td className="text-right">Type:</td>
							<td><b><AuditTypeLabel auditType={this.props.audit_cycle.type}/></b></td>
						</tr>
						<tr>
							<td className="text-right">Earnings:</td>
							<td className="truncateStyle1">
								{ this.props.fees ? <span>upto <b>₹ {this.props.fees}</b>, </span> : null }
								{ this.props.reimbursement ? <span>Reimbursement upto <b>₹ {this.props.reimbursement}</b></span> : null }
							</td>
						</tr>
						<tr>
							<td className="text-right">Dates:</td>
							<td>
								<b>{moment(this.props.audit_cycle.start_date).format("Do MMM")}</b> to <b>{moment(this.props.audit_cycle.end_date).format("Do MMM")}</b>
							</td>
						</tr>
					</tbody>
				</table>
				<Link to={viewLink} className="btn btn-lg btn-block btn-primary" style={{borderRadius:"0px 0px 4px 4px"}}>
					see all <b>{this.props.count}</b> opportunities
				</Link>
			</div>
		);
	}
}

class ClientList extends Component{
	static propTypes = {
		children: PropTypes.node,
		dispatch: PropTypes.func.isRequired,
		profileInfo: PropTypes.shape({
			is_complete: PropTypes.bool,
			mobile_number: PropTypes.string,
		}),
		audits: PropTypes.object,
		travel_audits: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state =  {
			kms: 100,
			loading: false,
			more_audit_loading: false,
			message: ""
		};
	}
	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};
	reloadAudits = (kms) => {
		this.setLoading(true);
		this.props.dispatch(fetchAudits({
			kms
		})).always(()=>{
			this.setLoading(false);
		});
	};
	componentDidMount() {
		this.reloadAudits(this.state.kms);
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	}
	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
		this.reloadAudits(e.target.value);
	};
	open_div = () =>{
		$(".assignment_process_button").hide();
		$(".assignment_info").show();
	};
	close_div = () => {
		$(".assignment_info").hide();
		$(".assignment_process_button").show();
	};
	onSearch = (city_id) => {
		this.setLoading(true);
		let kms = this.state.kms;
		this.props.dispatch(fetchTravelAudits({
			city_id,
			kms
		})).then((travel_audits)=>{
			this.setLoading(false);
			let message;
			if(travel_audits.length > 1){
				message = `Congrats! ${travel_audits.length} audits are found in this location`;
			}
			else if(travel_audits.length == 1){
				message = `Congrats! ${travel_audits.length} audit is found in this location`;
			}
			else{
				message = "No audits are found in this location";
			}
			this.setState({
				message
			});
		});
	};
	render(){
		if( this.props.profileInfo && ! this.props.profileInfo.is_complete){
			if( this.props.profileInfo.mobile_number){
				return (
					<div className="jumbotron text-center">
						<h2>Please complete your personal information</h2>
						<h3>Please <Link className="btn btn-success" to="details/profile/edit"> Click Here</Link> to begin by saving your details</h3>
						<p>We&#39;re sorry, but we need to know more about you to assign audits to you.</p>
					</div>
				);
			} else {
				return (
					<div className="jumbotron text-center">
						<h2>Please update your Mobile Number</h2>
						<h3>Please <Link className="btn btn-success" to="details/mobile_number/edit"> Click Here</Link> to update your mobile number.</h3>
						<p>We&#39;re sorry, but we need to know how to contact your begore assigning audits to you.</p>
					</div>
				);
			}
		}
		let auditCycles = [];
		let auditCycleExtra = {};
		for(let id in this.props.audits) {
			let ac = auditCycles.filter(ac => ac.id === this.props.audits[id].audit_cycle.id);
			if(ac.length === 0){
				auditCycleExtra[this.props.audits[id].audit_cycle.id] = {
					count: 1,
					fees: this.props.audits[id].earnings_per_audit,
					reimbursement: this.props.audits[id].reimbursement,
				};
				auditCycles.push(this.props.audits[id].audit_cycle);
			} else {
				auditCycleExtra[this.props.audits[id].audit_cycle.id].count++;
				if(auditCycleExtra[this.props.audits[id].audit_cycle.id].fees < this.props.audits[id].earnings_per_audit){
					auditCycleExtra[this.props.audits[id].audit_cycle.id].fees = this.props.audits[id].earnings_per_audit;
				}
				if(auditCycleExtra[this.props.audits[id].audit_cycle.id].reimbursement < this.props.audits[id].reimbursement){
					auditCycleExtra[this.props.audits[id].audit_cycle.id].reimbursement = this.props.audits[id].reimbursement;
				}
			}
		}

		for(let id in this.props.travel_audits) {
			let ac = auditCycles.filter(ac => ac.id === this.props.travel_audits[id].audit_cycle.id);
			if(ac.length === 0){
				auditCycleExtra[this.props.travel_audits[id].audit_cycle.id] = {
					count: 1,
					fees: this.props.travel_audits[id].earnings_per_audit,
					reimbursement: this.props.travel_audits[id].reimbursement,
				};
				auditCycles.push(this.props.travel_audits[id].audit_cycle);
			} else {
				auditCycleExtra[this.props.travel_audits[id].audit_cycle.id].count++;
				if(auditCycleExtra[this.props.travel_audits[id].audit_cycle.id].fees < this.props.travel_audits[id].earnings_per_audit){
					auditCycleExtra[this.props.travel_audits[id].audit_cycle.id].fees = this.props.travel_audits[id].earnings_per_audit;
				}
				if(auditCycleExtra[this.props.travel_audits[id].audit_cycle.id].reimbursement < this.props.travel_audits[id].reimbursement){
					auditCycleExtra[this.props.travel_audits[id].audit_cycle.id].reimbursement = this.props.travel_audits[id].reimbursement;
				}
			}
		}

		let auditCycleRows = [];
		for(let ac of auditCycles){
			auditCycleRows.push(<div className="col-sm-6 col-md-4" key={ac.id}>
				<AuditCycleRow audit_cycle={ac}
					count={auditCycleExtra[ac.id].count}
					fees={auditCycleExtra[ac.id].fees}
					reimbursement={auditCycleExtra[ac.id].reimbursement}
				/>
			</div>);
		}

		if(auditCycleRows.length === 0){
			auditCycleRows = (
				<div className="jumbotron text-center">
					<h2>There are no audits available in this location right now.</h2>
					<p>We will keep you informed when new audits are available.</p>
				</div>
			);
		}
		if(this.state.loading){
			auditCycleRows = <Loading/>;
		}
		return (
			<div>
				<button className="btn btn-success assignment_process_button pull-right" onClick={this.open_div}>Read audit assignment process</button>
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
					Available Audits within &nbsp;
					<div style={{width: "100px", display: "inline-block"}}>
						<FormSelect label="" value={this.state.kms} name="kms" onChange={this.inputChanged}>
							<option value="1"> 1 km</option>
							<option value="5"> 5 km</option>
							<option value="10"> 10 km</option>
							<option value="20"> 20 km</option>
							<option value="50"> 50 km</option>
							<option value="100"> 100 km</option>
						</FormSelect>
					</div>
				</h2>
				<div className="row col-md-12" style={{marginBottom:"10px"}}>
					<MoreAuditBox onSearch={this.onSearch} loading={this.state.more_audit_loading} message={this.state.message}/>
				</div>
				{auditCycleRows}
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		audits: store.audits,
		applications: store.applications,
		travel_audits: store.travel_audits,
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientList);
