import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../components/Loading.jsx";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { findPayments } from "../service/payment.js";
import { fetchConfig } from "../service/config.js";

import PaymentStatusLabel from "../../components/PaymentStatusLabel.jsx";

class PaymentRow extends React.Component{
	static propTypes = {
		payment: PropTypes.object.isRequired,
	};

	render(){
		return (
			<tr>
				<th>
					<b>{this.props.payment.get_audit_details.client_name}</b>
				</th>
				<th>
					<b>{moment(this.props.payment.get_audit_details.audit_date).format(momentDateFormat)}</b>
				</th>
				<th>
					<PaymentStatusLabel status={this.props.payment.status}/>
				</th>
				<th>
					<big><b>₹ {this.props.payment.amount}</b></big>
				</th>
				<th>
					{ this.props.payment.status == "PENDING" ? <p><b>{moment(this.props.payment.payment_due_date).format(momentDateFormat)}</b></p> : null }
				</th>
				<th>
					{ this.props.payment.paid_on ? <p><b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
				</th>
				<th>
					<Link to={`payment/${this.props.payment.id}/payment_concern`} className="btn btn-primary">Any Concern?</Link>
				</th>
			</tr>
		);
	}
}

export default class PaymentList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			payments: [],
			config: {},
		};
	}

	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};

	componentDidMount() {
		this.setLoading(true);
		findPayments().then(payments => {
			this.setState({
				payments
			});
		}).always(() =>{
			this.setLoading(false);
		});

		fetchConfig().then((config) => this.setState({config}));
	}

	render(){
		let rows = this.state.payments.map(p => <PaymentRow payment={p} key={p.id}/>);
		if(this.state.loading){
			return <Loading/>;
		}
		else{
			if(rows.length > 0){
				return (
					<div>
						<h2 className="page-header">
							Your Payments
						</h2>
						<p style={{fontSize:"150%"}}>
							<b>Payment terms:</b> Payment will be transferred into your bank account within <b>45 days</b> after the completion of the respective month of your report submission.
							<br/>
							Once the payment done from FloorWalk it might take 24-48 hours to transfer amount into your bank account depending on the working day and bank holidays.
							For any payment related queries, please write us at <a href={"mailto:" + this.state.config.ACCOUNTS_EMAIL}>{this.state.config.ACCOUNTS_EMAIL}</a> or you can click <b>Any Concern?</b> button.
						</p>
						<table className="table table-responsive">
							<thead>
								<tr>
									<th>Client</th>
									<th>Audit Date</th>
									<th>Payment Status</th>
									<th>Payment</th>
									<th>Payment Due date</th>
									<th>Paid on</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{rows}
							</tbody>
						</table>
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
}
