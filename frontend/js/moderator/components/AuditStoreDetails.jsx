import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Datetime from 'react-datetime';

import moment from 'moment';
import { momentDateFormat, url }  from '../../../config.js';

import { findById, complete, fail, unsubmit, submit, setAuditDate } from '../service/audit_store.js';

import { FormDateInput } from '../../components/FormInput.jsx';
import ExpandableDetails from '../../components/ExpandableDetails.jsx';
import { Calendar, Retweet, King, File, Download, Envelope, Earphone } from '../../components/Icons.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import MarkdownViewer from '../../components/MarkdownViewer.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

import AttachmentBox from './AttachmentBox.jsx';
import AuditStoreSections from './AuditStoreSections.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			auditStore: null,
			auditDateLoading: false,
			auditDateSuccess: false,
			auditDateError: false,
			errorMessage: "",
		};
	},
	setAuditStore: function(auditStore){
		this.setState({
			auditStore
		});
	},
	componentDidMount: function(){
		findById(this.props.params.auditStoreId).then(this.setAuditStore);
	},
	completeButtonClicked: function(e){
		complete(this.props.params.auditStoreId).then(this.setAuditStore, (err) => {
			if(err.responseJSON && err.responseJSON.non_field_errors){
				this.setState({
					errorMessage: err.responseJSON.non_field_errors[0]
				});
			}
		});
	},
	failButtonClicked: function(e){
		fail(this.props.params.auditStoreId).then(this.setAuditStore);
	},
	submitButtonClicked: function(e){
		submit(this.props.params.auditStoreId).then(this.setAuditStore);
	},
	unSubmitButtonClicked: function(e){
		unsubmit(this.props.params.auditStoreId).then(this.setAuditStore);
	},
	auditDateChanged: function(momentDate){
		this.setState({auditDateLoading: true});
		setAuditDate(this.state.auditStore.id, momentDate.format("YYYY-MM-DD")).then((auditStore) => {
			this.setAuditStore(auditStore);
			this.setState({auditDateSuccess: true, auditDateError: false});
		}, () => {
			this.setState({auditDateSuccess: false, auditDateError: true});
		}).always(() => {
			this.setState({auditDateLoading: false});
		});
	},
	render: function(){
		if(! this.state.auditStore){
			return <Loading/>;
		}

		let auditDateElement = moment(this.state.auditStore.audit_date).format(momentDateFormat);

		let failButton, completeButton, unSubmitButton, submitButton;
		if (this.state.auditStore.status === 'ASSIGNED'){
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">Submit</button>);
		}
		if(this.state.auditStore.status === 'ASSIGNED' || this.state.auditStore.status === 'SUBMITTED'){
			failButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-danger">Fail</button>);
		}
		if(this.state.auditStore.status === 'SUBMITTED'){
			unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-warning">Un Submit</button>);
			completeButton = (<button onClick={this.completeButtonClicked} type="button" className="btn btn-success">Complete</button>);

			let hasAuditDateError = this.state.auditDateError ? "has-error" : "";
			let hasAuditDateSuccess = this.state.auditDateSuccess ? "has-success" : "";
			auditDateElement = (<div className={"input-group " + hasAuditDateError + hasAuditDateSuccess}>
				<span className="input-group-addon"><Calendar/></span>
				<Datetime
					inputProps={{className:"form-control"}}
					disabled={this.state.auditDateLoading}
					timeFormat={false}
					dateFormat={momentDateFormat}
					closeOnSelect={true}
					onChange={this.auditDateChanged}
					value={this.state.auditStore.audit_date}
				/>
			</div>)
		}
		let auditorPhoneLink = (<a href={`tel:${this.state.auditStore.user.profileinfo.mobile_number}`}>{this.state.auditStore.user.profileinfo.mobile_number}</a>);
		let auditorEmailLink = (<a href={`mailto:${this.state.auditStore.user.email}`}>{this.state.auditStore.user.email}</a>);

		let errorMessageElement = (<span>{this.state.errorMessage}</span>);

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/">Audit Cycle</Link></li>
					<li><Link to={`/audit_cycle/${this.state.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.state.auditStore.audit.audit_cycle.name}</Link></li>
					<li className="active"><File/> {moment(this.state.auditStore.audit_date).format(momentDateFormat)}</li>
				</ol>
				<h2 className="page-header">
					<File/> Audit Report
				</h2>
				<div className="row">
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
									<b>{this.state.auditStore.audit.store.name}</b><br/>
									<small>{this.state.auditStore.audit.store.address}</small>
								</td>
							</tr>
							<tr>

								<td className="text-right">Location:</td>
								<th>{`${this.state.auditStore.audit.store.location.name}, ${this.state.auditStore.audit.store.location.city.name}`}</th>
							</tr>
							<tr>
								<td className="text-right">Type:</td>
								<th>{getAuditType(this.state.auditStore.audit.audit_cycle.type)}</th>
							</tr>
							<tr>
								<td className="text-right">Auditor:</td>
								<td>
									<b>{this.state.auditStore.user.profileinfo.first_name} {this.state.auditStore.user.profileinfo.last_name}</b><br/>
									( <Earphone/> {auditorPhoneLink})
									( <Envelope/> {auditorEmailLink})
								</td>
							</tr>
							<tr>
								<td className="text-right">Audit Date:</td>
								<th>{auditDateElement}</th>
							</tr>
							<tr>
								<td className="text-right">Status:</td>
								<th><AuditStoreStatusLabel status={this.state.auditStore.status}/></th>
							</tr>
						</tbody>
					</table>
					<div className="panel-footer text-right">
						{errorMessageElement}
						{submitButton}&nbsp;{unSubmitButton}&nbsp;{completeButton}&nbsp;{failButton}
					</div>
				</div>
				</div>
				<div className="col-md-6">
					<div className="panel panel-default">
						<div className="panel-body">
							<MarkdownViewer markdown={this.state.auditStore.audit.post_approval_description || ""  + '\n\n' + this.state.auditStore.audit.audit_cycle.post_approval_description || ""}/>
						</div>
					</div>
				</div>
				</div>
				<AttachmentBox auditStoreId={this.props.params.auditStoreId} auditStore={this.state.auditStore}/>
				<AuditStoreSections auditStoreId={this.props.params.auditStoreId} auditStore={this.state.auditStore}/>
				{this.props.children}
			</div>
		);
	},
});

