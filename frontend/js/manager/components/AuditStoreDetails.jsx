import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from 'react-s-alert';

import Datetime from 'react-datetime';

import moment from 'moment';
import { momentDateFormat, url }  from '../../../config.js';

import { fetchAuditStore, completeAuditStore, failAuditStore, withdrawAuditStore, submitAuditStore, unSubmitAuditStore, updateAuditStore, uncompleteAuditStore, acceptAuditStore, rejectAuditStore } from '../actions/audit_store.js';
import { setAuditDate } from '../service/audit_store.js';

import { FormDateInput } from '../../components/FormInput.jsx';
import ExpandableDetails from '../../components/ExpandableDetails.jsx';
import { Calendar, Retweet, King, File, Download } from '../../components/Icons.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import AuditStoreRating from '../../components/AuditStoreRating.jsx';
import { LabelValue_2_10 } from '../../components/LabelValue.jsx';
import MarkdownViewer from '../../components/MarkdownViewer.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

import AttachmentDisplayBox from './AttachmentDisplayBox.jsx';

var AuditStoreDetails = React.createClass({
	getInitialState: function(){
		return {
			auditDateLoading: false
		};
	},
	componentDidMount: function(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
	},
	withdrawButtonClicked: function(e){
		this.props.dispatch(withdrawAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT WITHDRAWN");
		});
	},
	completeButtonClicked: function(e){
		this.props.dispatch(completeAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT COMPLETED");
		});
	},
	failButtonClicked: function(e){
		this.props.dispatch(failAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT FAILED");
		});
	},
	submitButtonClicked: function(e){
		this.props.dispatch(submitAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT SUBMITTED");
		});
	},
	unSubmitButtonClicked: function(e){
		this.props.dispatch(unSubmitAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT Un SUBMITTED");
		});
	},
	uncompleteButtonClicked: function(e){
		this.props.dispatch(uncompleteAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT Un COMPLETED");
		});
	},
	acceptButtonClicked: function(e){
		this.props.dispatch(acceptAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT ACCEPTED");
		});
	},
	rejectButtonClicked: function(e){
		this.props.dispatch(rejectAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT REJECTED");
		});
	},
	auditDateChanged: function(momentDate){
		this.setState({auditDateLoading: true});
		setAuditDate(this.props.auditStore.id, momentDate.format("YYYY-MM-DD")).then((auditStore) => {
			this.props.dispatch(updateAuditStore(auditStore));
			this.setState({auditDateSuccess: true, auditDateError: false});
			Alert.success("AUDIT DATE CHANGED");
		}, () => {
			this.setState({auditDateSuccess: false, auditDateError: true});
			Alert.warning("AUDIT DATE INVALID");
		}).always(() => {
			this.setState({auditDateLoading: false});
		});
	},
	render: function(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let auditDateElement = moment(this.props.auditStore.audit_date).format(momentDateFormat);

		let withdrawButton, failButton, completeButton, unSubmitButton, submitButton, uncompleteButton, acceptButton, rejectButton;
		if (this.props.auditStore.status === 'ACKNOWLEDGED'){
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">Submit</button>);
		}
		if (this.props.auditStore.status === 'COMPLETED'){
			uncompleteButton = (<button onClick={this.uncompleteButtonClicked} type="button" className="btn btn-default">Un Complete</button>);
			acceptButton = (<Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store/${this.props.auditStore.id}/accept`} className="btn btn-success">Accept</Link>);
			rejectButton = (<button onClick={this.rejectButtonClicked} type="button" className="btn btn-danger">Reject</button>);
		}
		if(this.props.auditStore.status === 'ASSIGNED' || this.props.auditStore.status === "ACKNOWLEDGED" || this.props.auditStore.status === 'SUBMITTED'){
			withdrawButton = (<button onClick={this.withdrawButtonClicked} type="button" className="btn btn-default">Withdraw</button>);
			failButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-danger">Fail</button>);
		}
		if(this.props.auditStore.status === 'SUBMITTED'){
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
					value={this.props.auditStore.audit_date}
				/>
			</div>)
		}
		let detailsElement = (<div className="panel-body">
			<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
			<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
			</div>);
		let auditorUrl = `/auditor/${this.props.auditStore.user.id}`;
		let auditorLink = (<Link to={auditorUrl}>{this.props.auditStore.user.profileinfo.first_name} {this.props.auditStore.user.profileinfo.last_name}</Link>);
		let auditorPhoneLink = (<a href={`tel:${this.props.auditStore.user.profileinfo.mobile_number}`}>{this.props.auditStore.user.profileinfo.mobile_number}</a>);

		let errorFirst;
		if(this.props.errors && this.props.errors.non_field_errors){
			errorFirst = (<span>{this.props.errors.non_field_errors[0]}</span>);
		}

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditStore.audit.audit_cycle.client.id}/audit_cycle`}><King/> {this.props.auditStore.audit.audit_cycle.client.name}</Link></li>
					<li><Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.props.auditStore.audit.audit_cycle.name}</Link></li>
					<li className="active"><File/> {this.props.auditStore.audit.store.name}</li>
				</ol>
				<h2 className="page-header">
					<File/> Audit Report
					<a className="btn btn-default pull-right" href={url.api_base_path + 'manager/client/' + this.props.auditStore.audit.store.client.id + '/audit_store/' + this.props.auditStore.id + '/xlsx_report'}>
						<Download/> Excel Report
					</a>
				</h2>
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">Audit Details</h4>
					</div>
					<table className="table table-striped">
						<tbody>
							<tr>
								<td className="text-right">Client:</td>
								<th>{this.props.auditStore.audit.audit_cycle.client.name}</th>
							</tr>
							<tr>
								<td className="text-right">Store:</td>
								<th>{this.props.auditStore.audit.store.name}</th>
							</tr>
							<tr>

								<td className="text-right">Address:</td>
								<th>{`${this.props.auditStore.audit.store.address}, ${this.props.auditStore.audit.store.city.name}`}</th>
							</tr>
							<tr>
								<td className="text-right">Type:</td>
								<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
							</tr>
							<tr>
								<td className="text-right">Fees:</td>
								<th>₹ {this.props.auditStore.audit.earnings_per_audit}</th>
							</tr>
							<tr>
								<td className="text-right">Reimbursement upto:</td>
								<th>₹ {this.props.auditStore.audit.reimbursement}</th>
							</tr>
							<tr>
								<td className="text-right">Auditor:</td>
								<td><b>{auditorLink}</b> ( {auditorPhoneLink})</td>
							</tr>
							<tr>
								<td className="text-right">Audit Date:</td>
								<th>{auditDateElement}</th>
							</tr>
							<tr>
								<td className="text-right">Status:</td>
								<th><AuditStoreStatusLabel status={this.props.auditStore.status}/></th>
							</tr>
							<tr>
								<td className="text-right">Rating:</td>
								<th>
									<AuditStoreRating rating={this.props.auditStore.qa_rating}/> (<Link to={`/audit_store/${this.props.auditStore.id}/qa_rating`}>change</Link>)
								</th>
							</tr>
						</tbody>
					</table>
					{detailsElement}
					<div className="panel-footer text-right">
						{errorFirst}
						{submitButton}&nbsp;{unSubmitButton}&nbsp;{withdrawButton}&nbsp;{completeButton}&nbsp;{failButton}&nbsp;{uncompleteButton}&nbsp;{acceptButton}&nbsp;{rejectButton}
					</div>
				</div>
				<AttachmentDisplayBox auditStoreId={this.props.params.auditStoreId}/>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		errors: store.errors
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
