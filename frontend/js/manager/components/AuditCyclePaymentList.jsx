import React from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import Datetime from "react-datetime";

import moment from "moment";
import { momentDateFormat, url}  from "../../../config.js";

import Jumbotron from "../../components/Jumbotron.jsx";
import { Download } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import PaymentStatusLabel from "../../components/PaymentStatusLabel.jsx";
import AuditorNameDisplay from "./AuditorNameDisplay.jsx";

import { pay, fail} from "../service/payment.js";
import { findPaymentsByAuditCycleId, payAllPendingPaymentsForAuditCycle } from "../service/payment.js";

export class PaymentRow extends React.Component{

	static propTypes = {
		onFail: PropTypes.func,
		onChange: PropTypes.func,
		payment: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			payButtonMessage: "",
		};
	}

	payButtonClicked = () => {
		pay(this.props.payment.id).then((payment) => {
			Alert.success("PAYMENT MARKED AS PAID");
			this.setState({
				payButtonMessage: "Marked as paid",
			});
			this.props.onChange && this.props.onChange(payment);
		}, (err) => {
			let errInfo = err.responseJSON && err.responseJSON.non_field_errors || {};
			this.setState({
				payButtonMessage: errInfo[0],
			});
			Alert.error(errInfo[0]);
		});
	};

	failButtonClicked = () => {
		fail(this.props.payment.id).then((payments) => {
			Alert.success("PAYMENT MARKED AS FAILED");
			this.setState({
				payButtonMessage: "Marked as failed",
			});
			this.props.onFail && this.props.onFail(payments);
		}, (err) => {
			let errInfo = err.responseJSON && err.responseJSON.non_field_errors || {};
			this.setState({
				payButtonMessage: errInfo[0],
			});
			Alert.error(errInfo[0]);
		});
	};

	render(){
		let paymentStatus = this.props.payment.status;
		let paymentButton = null;

		if(paymentStatus == "PENDING"){
			paymentButton = (<button onClick={this.payButtonClicked} type="button" className="btn btn-default">Pay</button>);
		}
		else if(paymentStatus == "PAID"){
			paymentButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-default">Fail</button>);
		}

		return(
			<tr>
				<td><AuditorNameDisplay user={this.props.payment.user} /></td>
				<td>{moment(this.props.payment.added_on).format(momentDateFormat)}</td>
				<td>{moment(this.props.payment.audit_date).format(momentDateFormat)}</td>
				<td>{moment(this.props.payment.paid_on).format(momentDateFormat)}</td>
				<td className="text-right"><big>₹ {this.props.payment.amount}</big></td>
				<td><PaymentStatusLabel status={paymentStatus}/></td>
				<td>{paymentButton}&nbsp;{this.state.payButtonMessage}</td>
			</tr>
		);
	}
}

export default class AuditCyclePaymentList extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			payments: [],
			start_date: "",
			end_date: "",
			filter_error: ""
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	};

	reloadData = (start_date = "", end_date = "") => {
		this.setLoading(true);
		findPaymentsByAuditCycleId(this.props.params.auditCycleId, start_date, end_date).then( payments => {
			this.setState({
				payments
			});
		}).always(() => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData();
	}

	payAllPendingPayments = () => {
		payAllPendingPaymentsForAuditCycle(this.props.params.auditCycleId).then(count => {
			this.reloadData();
			Alert.success(`${count} PAYMENTS MARKED AS PAID`);
		});
	};

	paymentChanged = (payment) => {
		let i = this.state.payments.findIndex(p => p.id === payment.id);
		if( i !== -1){
			let payments = this.state.payments;
			payments[i] = payment;
			this.setState({
				payments
			});
		}
	};
	paymentFailed = (newPayments) => {
		let statePayments = this.state.payments.slice();
		newPayments.forEach((payment) => {
			let i = statePayments.findIndex(p => p.id === payment.id);
			if( i !== -1){
				statePayments[i] = payment;
			}
			else{
				statePayments.unshift(payment);
			}
		});

		this.setState({
			payments: statePayments
		});
	};

	startDateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				start_date: date.format("YYYY-MM-DD"),
				filter_error:""
			});
		}
	};

	endDateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				end_date: date.format("YYYY-MM-DD"),
				filter_error:""
			});
		}
	};

	findFilter = () => {
		if(this.state.start_date === "" || this.state.end_date === ""){
			this.setState({
				filter_error: "Please select valid date"
			});
		}
		else{
			this.reloadData(this.state.start_date, this.state.end_date);
		}
	};

	clearFilter = () => {
		this.setState({
			start_date:"",
			end_date:"",
		});
		this.reloadData();
	};

	render(){

		let rows = this.state.payments.map( p => (<PaymentRow payment={p} key={p.id} onChange={this.paymentChanged} onFail={this.paymentFailed}/>));

		let table = this.state.loading ? <Loading/> : rows.length === 0 ? (
			<Jumbotron key="empty" heading="no payments here" para="payments for accepted reports will appear here"/>
		) : (
			<table className="table table-striped">
				<thead>
					<tr>
						<th>Auditor Name</th>
						<th>Added Date</th>
						<th>Audit Date</th>
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

		return(
			<div>
				<h3 className="page-header">
					<b>₹</b> Payments
					<span className="pull-right">
						<a className="btn btn-default" href={url.api_base_path + `manager/audit_cycle/${this.props.params.auditCycleId}/payment/pending/xlsx`}>
							<Download/> Pending Payment List
						</a>
						<button className="btn btn-default" onClick={this.payAllPendingPayments}>Pay All Pending</button>
					</span>
				</h3>
				<div style={{marginBottom:"15px"}}>
					<div style={{width: "150px",display: "inline-block"}}>
						<label className="control-label" style={{fontSize: "14px"}}>&nbsp;Start Date:</label>
						<Datetime name="start_date" value={this.state.start_date} onChange={this.startDateChanged} timeFormat={false} dateFormat="YYYY-MM-DD" closeOnSelect={true}/>
					</div>
					&nbsp;
					<div style={{width: "150px",display: "inline-block"}}>
						<label className="control-label" style={{fontSize: "14px"}}>&nbsp;End Date:</label>
						<Datetime name="end_date" value={this.state.end_date} onChange={this.endDateChanged} timeFormat={false} dateFormat="YYYY-MM-DD" closeOnSelect={true}/>
					</div>
					&nbsp;
					<div style={{width: "53px",display: "inline-block"}}>
						<button className="btn btn-primary" onClick={this.findFilter}>Find</button>
					</div>
					&nbsp;
					<div style={{width: "53px",display: "inline-block"}}>
						<button className="btn btn-primary" onClick={this.clearFilter}>Clear</button>
					</div>
					<p>{this.state.filter_error}</p>
				</div>
				{table}
				{this.props.children}
			</div>
		);
	}
}

