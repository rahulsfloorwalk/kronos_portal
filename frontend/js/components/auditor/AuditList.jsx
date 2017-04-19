import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { affectInputEventToComponent } from '../../react_utils.js';

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


var AuditRow = React.createClass({
	render: function(){
		let button, auditDate, textLabel;
		if( typeof this.props.application === "undefined" || this.props.application.status === "NOT_APPLIED"){
			let applyLink = `/audit/${this.props.audit.id}/apply`;
			let applyButton = <Link to={applyLink} className="btn btn-primary"><ShareAlt/> Apply</Link>;
			button = applyButton;
			textLabel = <ApplicationStatusLabel status="NOT_APPLIED"/>;
		}
		else if( this.props.application.status === "APPLIED"){
			let cancelLink = `/audit/${this.props.audit.id}/cancel`;
			let cancelButton = <Link to={cancelLink}>&nbsp;cancel application</Link>;
			auditDate =  <span>You have <b className="text-info">applied</b> for an audit on <b>{moment(this.props.application.audit_date).format(momentDateFormat)}.</b></span>;
			button = cancelButton;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} 
		else if( this.props.application.status === "APPROVED"){
			auditDate =  <span>Your <b className="text-success">approved</b> audit date is <b>{moment(this.props.application.audit_date).format(momentDateFormat)}</b>. Don't forget to conduct the audit!</span>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} else {
			button = <br/>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		}
		let fees = this.props.audit.earnings_per_audit ? <span>Flat: <big><b>₹ {this.props.audit.earnings_per_audit}</b></big>, </span> : "";
		let reimb = this.props.audit.reimbursement ? <span>Reimbursement upto: <big><b>₹ {this.props.audit.reimbursement}</b></big></span> : "";

		let detailsElement = <ExpandableDetails details={this.props.audit.audit_cycle.description}/>;
		let mediaImgStyle = {
			width: "128px",
			margin:"10px"
		};
		let mediaImgStyle2 = {
			width: "96px"
		};
		/*
				<div>
					<img style={mediaImgStyle2} className="pull-right" src={this.props.audit.audit_cycle.client.logo_url} alt="client logo"/>
					<h4 className="">{this.props.audit.audit_cycle.client.name}</h4>
					<table>
						<tbody>
							<tr>
								<td>Type</td>
								<td>Location</td>
								<td>Fees</td>
								<td>Dates</td>
								<td>Details</td>
								<td>Status</td>
							</tr>
						</tbody>
					</table>
							<p>Type:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b>,
							Location:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b>, 
							Fees:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b>, 
							Dates:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b>, 
							Details:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b>, 
							Status:<b>{getAuditType(this.props.audit.audit_cycle.type)}</b></p>
					<hr/>
				</div>
				<div className="panel panel-default">
					<div className="panel-body">
							<div className="row">
						<div className="col-md-3">
							<img className="img-responsive" src={this.props.audit.audit_cycle.client.logo_url}/>
						</div>
						<div className="col-md-9">
							<div className="row">
							<LabelValue_2_10 label="Company:" value={this.props.audit.audit_cycle.client.name}/>
							<LabelValue_2_10 label="Type:" value={getAuditType(this.props.audit.audit_cycle.type)}/>
							<LabelValue_2_10 label="Location:" value={`${this.props.audit.store.location.name}, ${this.props.audit.store.location.city.name}`}/>
							<LabelValue_2_10 label="Fees:" value={<span>{fees}{reimb}</span>}/>
							<LabelValue_2_10 label="Dates:" value={<span><b>{moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat)}</b> to <b>{moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat)}</b></span>}/>
							<LabelValue_2_10 label="Details:" value={detailsElement}/>
							<LabelValue_2_10 label="Status:" value={textLabel}/>
							</div>
						<p className="text-right">
							{auditDate}&nbsp;&nbsp;{button}
						</p>
						</div>
							</div>
					</div>
				</div>
				*/
		return (
			<div>
					<div className="media">
						<div className="media-left hidden-xs">
							<img style={mediaImgStyle} className="media-object" src={this.props.audit.audit_cycle.client.logo_url} alt="client logo"/>
						</div>
						<div className="media-body">
						<div className="pull-right hidden-sm hidden-md hidden-lg">
							<img style={mediaImgStyle2} className="media-object" src={this.props.audit.audit_cycle.client.logo_url} alt="client logo"/>
						</div>
						<h3 className="media-heading">
							{this.props.audit.audit_cycle.client.name}&nbsp;
							<small>
								{this.props.audit.store.location.name}, {this.props.audit.store.location.city.name}
							</small>
						</h3>
						<div className="" style={{width:"100%",margin:"10px 0px"}}>
							<div className="row">
								<div className="col-sm-2">
									<h5>Type</h5>
									<b><AuditTypeLabel auditType={this.props.audit.audit_cycle.type}/></b>
								</div>
								<div className="col-sm-2">
									<h5>Start Date</h5>
									<b>{moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat)}</b>
								</div>
								<div className="col-sm-2">
									<h5>End Date</h5>
									<b>{moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat)}</b>
								</div>
								<div className="col-sm-4">
									<h5>Earnings</h5>
									{<span>{fees}{reimb}</span>}
								</div>
								<div className="col-sm-2">
									<h5>Status</h5>
									<b>{textLabel}</b>
								</div>
							</div>
						</div>
						<p>{this.props.audit.audit_cycle.description}</p>
						<p className="">
							{auditDate}
							{button}
						</p>
						</div>
						<hr/>
					</div>
			</div>
		);
	},
});

var AuditList = React.createClass({
	getInitialState: function(){
		return {
			kms: 50,
			loading: false
		};
	},
	reloadAudits: function(kms){
		this.setState({loading:true})
		this.props.dispatch(fetchAudits({
			kms
		})).always(()=>{
			this.setState({loading:false})
		});
	},
	componentDidMount: function() {
		this.reloadAudits(this.state.kms)
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
		this.reloadAudits(e.target.value)
	},
	render: function(){
		if( this.props.profileInfo && ! this.props.profileInfo.is_complete){
			return (
				<div className="jumbotron text-center">
					<h2>Please complete your personal information</h2>
					<h3>Please <Link className="btn btn-success" to="details/profile/edit"> Click Here</Link> to begin by saving your details</h3>
					<p>We're sorry, but we need to know more about you to assign audits to you.</p>
				</div>
			);
		}
		var rows = [];
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
		if(rows.length === 0){
			rows = (
				<div className="jumbotron text-center">
					<h2>There are no audits available in this location right now.</h2>
					<p>We will keep you informed when new audits are available.</p>
				</div>
			);
		}
		if(this.state.loading){
			rows = <Loading/>;
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
				{rows}
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		audits: store.audits,
		applications: store.applications
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList); 
