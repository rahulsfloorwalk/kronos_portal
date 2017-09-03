import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';
import { affectInputEventToComponent } from '../../react_utils.js';

import { truncateStyle } from '../../styles.js';

import { fetchApplications } from '../../auditor/actions/application.js';
import { fetchAudits } from '../../auditor/actions/audit.js';
import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

import AuditTypeLabel from '../AuditTypeLabel.jsx';
import FormSelect from '../FormSelect.jsx';
import ExpandableDetails from '../ExpandableDetails.jsx';
import { Cross, ShareAlt } from '../Icons.jsx';
import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import Loading from '../Loading.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';

class AuditCycleRow extends Component{
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
						<img style={mediaImgStyle} src={this.props.audit_cycle.client.logo_url} alt="client logo" title={this.props.audit_cycle.client.name}/>
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
							<td style={truncateStyle}>
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
	constructor(props){
		super(props);
		this.state =  {
			kms: 100,
			loading: false
		};
	}
	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	}
	reloadAudits = (kms) => {
		this.setLoading(true);
		this.props.dispatch(fetchAudits({
			kms
		})).always(()=>{
			this.setLoading(false);
		});
	}
	componentDidMount() {
		this.reloadAudits(this.state.kms)
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	}
	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
		this.reloadAudits(e.target.value);
	}
	render(){
		if( this.props.profileInfo && ! this.props.profileInfo.is_complete){
			return (
				<div className="jumbotron text-center">
					<h2>Please complete your personal information</h2>
					<h3>Please <Link className="btn btn-success" to="details/profile/edit"> Click Here</Link> to begin by saving your details</h3>
					<p>We're sorry, but we need to know more about you to assign audits to you.</p>
				</div>
			);
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
		applications: store.applications
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientList); 
