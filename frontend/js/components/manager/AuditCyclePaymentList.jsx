import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import Jumbotron from '../Jumbotron.jsx';
import { File, Download } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import PaymentStatusLabel from '../PaymentStatusLabel.jsx';

import { payAuditStore, unpayAuditStore} from '../../manager/actions/audit_store.js';
import { findPaymentsByAuditCycleId } from '../../manager/service/payment.js';

class __PaymentRow extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			payButtonMessage: "",
		};
	}

	paymentChanged = (payment) => {
		if(this.props.onChange){
			this.props.onChange();
		}
	}

	payButtonClicked = (e) => {
		this.props.dispatch(payAuditStore(this.props.payment.audit_store_id)).then(() => {
			this.setState({
				payButtonMessage: "Marked as paid",
			});
			this.paymentChanged();
		}, (err) => {
			let errInfo = err.responseJSON && err.responseJSON.non_field_errors || {};
			this.setState({
				payButtonMessage: errInfo[0],
			});
		});
	}

	unpayButtonClicked = (e) => {
		this.props.dispatch(unpayAuditStore(this.props.payment.audit_store_id)).then(() => {
			this.setState({
				payButtonMessage: "Marked as unpaid",
			});
			this.paymentChanged();
		}, (err) => {
			let errInfo = err.responseJSON && err.responseJSON.non_field_errors || {};
			this.setState({
				payButtonMessage: errInfo[0],
			});
		});
	}

	render(){
		let auditorUrl = `/auditor/${this.props.payment.user.id}`;
		let auditorLink = (<Link to={auditorUrl}>{this.props.payment.user.profileinfo.first_name} {this.props.payment.user.profileinfo.last_name}</Link>);
		let auditorPhoneLink = (<a href={`tel:${this.props.payment.user.profileinfo.mobile_number}`}>{this.props.payment.user.profileinfo.mobile_number}</a>);
		let paymentStatus = this.props.payment.status;
		let paymentButton = null;
		let acceptButton = null;

		if(paymentStatus == 'PENDING'){
			paymentButton = (<button onClick={this.payButtonClicked} type="button" className="btn btn-default">Pay</button>);
		}
		else if(paymentStatus == 'PAID'){
			paymentButton = (<button onClick={this.unpayButtonClicked} type="button" className="btn btn-default">Unpay</button>);
		}

		return(
			<tr>
				<td><b>{auditorLink}</b> <br/>( {auditorPhoneLink})</td>
				<td>{moment(this.props.payment.added_on).format(momentDateFormat)}</td>
				<td>{moment(this.props.payment.paid_on).format(momentDateFormat)}</td>
				<td className="text-right"><big>₹ {this.props.payment.amount}</big></td>
				<td><PaymentStatusLabel status={paymentStatus}/></td>
				<td>{paymentButton}&nbsp;{this.state.payButtonMessage}</td>
			</tr>
		);
	}
}

let PaymentRow = ReactRedux.connect()(__PaymentRow);

class AuditCyclePaymentList extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			payments: []
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	}

	reloadData = () => {
		this.setLoading(true);
		findPaymentsByAuditCycleId(this.props.params.auditCycleId).then( payments => {
			this.setState({
				payments
			});
		}).always(() => this.setLoading(false));
	}

	componentDidMount(){
		this.reloadData();
	}

	render(){

		let rows = this.state.payments.map( p => (<PaymentRow payment={p} key={p.id} onChange={this.reloadData}/>));

		let table = this.state.loading ? <Loading/> : rows.length === 0 ? (
			<Jumbotron key="empty" heading="no payments here" para="payments for accepted reports will appear here"/>
			) : (
			<table className="table table-striped">
			<thead>
			<tr>
				<th>Auditor Name</th>
				<th>Added Date</th>
				<th>Paid Date</th>
				<th className="text-right">Amount</th>
				<th>Payment Status</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
			</table>
		);

		if( rows.length === 0){
		}

		return(
			<div>
			<h3 className="page-header">
			<b>₹</b> Payments
			<a className="btn btn-default pull-right" href={url.api_base_path + 'manager/audit_cycle/' + this.props.params.auditCycleId + '/payment/pending/csv'}>
			<Download/> Pending Payment List
			</a>
			</h3>
			{table}
			{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {};
}

export default ReactRedux.connect(mapStoreToProps)(AuditCyclePaymentList);

