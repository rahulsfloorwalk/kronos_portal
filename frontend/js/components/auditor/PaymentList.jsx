import React from "react";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { findPayments } from "../../auditor/service/payment.js";

import PaymentStatusLabel from "../PaymentStatusLabel.jsx";

class PaymentRow extends React.Component{
	static propTypes = {
		payment: PropTypes.object.isRequired,
	};

	render(){
		return (<div className="panel panel-default">
			<div className="panel-body">
				<div className="row hidden-md hidden-sm hidden-lg">
					<div className="col-xs-4">
						<p><big style={{fontSize: "170%"}}><b>₹ {this.props.payment.amount}</b></big></p>
						<p><PaymentStatusLabel status={this.props.payment.status}/></p>
					</div>
					<div className="col-xs-8">
						<p>Added on: <b>{moment(this.props.payment.added_on).format(momentDateFormat)}</b></p>
						{ this.props.payment.paid_on ? <p>Paid on: <b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
						<p>{this.props.payment.comment}</p>
					</div>
				</div>
				<div className="row hidden-xs hidden-md hidden-lg">
					<div className="col-sm-4">
						<p><big style={{fontSize: "170%"}}><b>₹ {this.props.payment.amount}</b></big></p>
						<p><PaymentStatusLabel status={this.props.payment.status}/></p>
					</div>
					<div className="col-sm-4">
						<p>Added on: <b>{moment(this.props.payment.added_on).format(momentDateFormat)}</b></p>
						{ this.props.payment.paid_on ? <p>Paid on: <b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
					</div>
					<div className="col-sm-4">
						<p>{this.props.payment.comment}</p>
					</div>
				</div>
				<div className="row hidden-xs hidden-sm">
					<div className="col-md-2 text-right">
						<big style={{fontSize: "170%"}}><b>₹ {this.props.payment.amount}</b></big>
					</div>
					<div className="col-md-1">
						<p><PaymentStatusLabel status={this.props.payment.status}/></p>
					</div>
					<div className="col-md-3 text-right">
						<p>Added on: <b>{moment(this.props.payment.added_on).format(momentDateFormat)}</b></p>
						{ this.props.payment.paid_on ? <p>Paid on: <b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
					</div>
					<div className="col-md-6">
						<p>{this.props.payment.comment}</p>
					</div>
				</div>
			</div>
		</div>);
	}
}

export default class PaymentList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			payments: [],
		};
	}

	setLoading = (loading) => {
		this.setState(oldState => {
			Object.assign({}, oldState, {
				loading
			});
		});
	};

	componentDidMount() {
		this.setLoading(true);
		findPayments().then(payments => {
			this.setState({
				payments
			});
		}).always(() => this.setLoading(false));
	}

	render(){
		let rows = this.state.payments.map(p => <PaymentRow payment={p} key={p.id}/>);
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						Your Payments
					</h2>
					{rows}
				</div>
			);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no payments here.</h2>
					<h3>Pending payments will start appearing once your reports have been accepted!</h3>
					<p>We will keep you informed when payments are approved and processed for you</p>
				</div>
			);
		}
	}
}

