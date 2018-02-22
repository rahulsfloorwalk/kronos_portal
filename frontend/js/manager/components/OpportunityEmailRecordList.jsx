import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Alert from 'react-s-alert';

import moment from 'moment';
import { momentDateTimeFormat, url}  from '../../../config.js';

import Jumbotron from '../../components/Jumbotron.jsx';
import { File, Download, Plus } from '../../components/Icons.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import PaymentStatusLabel from '../../components/PaymentStatusLabel.jsx';

import { payAuditStore, unpayAuditStore} from '../actions/audit_store.js';
import { findOpportunityEmailRecordsByAuditCycleId } from '../service/opportunity_email.js';

class OpportunityEmailRecordRow extends React.Component{
	constructor(props){
		super(props);
		this.state = {};
	}
	render(){
		let percent = this.props.record.progress_count === this.props.record.total_count ? 100 : this.props.record.progress_count * 100 / this.props.record.total_count;
		return(
			<tr>
				<td><b>{this.props.record.city.name}</b></td>
				<td className="text-right">{moment(this.props.record.created_at).format(momentDateTimeFormat)}</td>
				<td>
					<div className="progress">
						<div className="progress-bar" role="progressbar" style={{width: percent+"%", minWidth: "3em"}}>
							<span className="sr-only">{this.props.record.progress_count}/{this.props.record.total_count}</span>
							{this.props.record.progress_count}/{this.props.record.total_count}
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

export default class OpportunityEmailRecordList extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			records: [],
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	}

	reloadData = (auditCycleId) => {
		this.setLoading(true);
		findOpportunityEmailRecordsByAuditCycleId(auditCycleId).then( records => {
			this.setState({
				records
			});
		}).always(() => this.setLoading(false));
	}

	componentDidMount(){
		this.reloadData(this.props.params.auditCycleId);
		this.setState({ intervalId: window.setInterval(() => this.reloadData(this.props.params.auditCycleId), 10000)});
	}

	componentWillReceiveProps(nextProps){
		this.reloadData(nextProps.params.auditCycleId);
	}

	componentWillUnmount(){
		window.clearInterval(this.state.intervalId);
	}

	render(){

		let rows = this.state.records.map( r => (<OpportunityEmailRecordRow record={r} key={r.id}/>));

		let table = rows.length === 0 ? (
			<Jumbotron key="empty" heading="no emails scheduled" para="scheduled emails for cities will appear here"/>
			) : (
			<table className="table table-striped">
			<thead>
			<tr>
				<th style={{width:"25%"}}>City</th>
				<th style={{width:"25%"}} className="text-right">Added Date</th>
				<th style={{width:"50%"}}>Progress</th>
			</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
			</table>
		);

		return(
			<div>
			<h3 className="page-header">
				<Link to={`/audit_cycle/${this.props.params.auditCycleId}/opportunity_email/schedule`} className="btn btn-default pull-right">
					<Plus/> Add City
				</Link>
				Opportunity Emails Scheduled
			</h3>
			{ this.state.loading && this.state.records.length === 0 ?  <Loading/> : table }
			{this.props.children}
			</div>
		);
	}
}
