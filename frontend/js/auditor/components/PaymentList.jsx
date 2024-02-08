import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../components/Loading.jsx";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { findPayments, findPaymentSummary, findPaymentStatus} from "../service/payment.js";
import { fetchConfig } from "../service/config.js";

import PaymentStatusLabel from "../../components/PaymentStatusLabel.jsx";

class PaymentRow extends React.Component{
	static propTypes = {
		payment: PropTypes.object.isRequired,
	};

	render(){
		return (
			<tr>
				<th className="text-center">
					<b>{this.props.payment.get_audit_details.client_name}</b>
				</th>
				<th className="text-center">
					<b>{moment(this.props.payment.get_audit_details.audit_date).format(momentDateFormat)}</b>
				</th>
				<th className="text-center">
					<PaymentStatusLabel status={this.props.payment.status}/>
				</th>
				<th className="text-center">
					<big><b>₹ {this.props.payment.amount}</b></big>
				</th>
				<th className="text-center">
					<big><b>₹ {this.props.payment.reimbursement}</b></big>
				</th>
				<th className="text-center">
					{ this.props.payment.status == "PENDING" ? <p><b>{moment(this.props.payment.payment_due_date).format(momentDateFormat)}</b></p> : null }
				</th>
				<th className="text-center">
					{ this.props.payment.paid_on ? <p><b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
				</th>
				<th className="text-center">
					<Link to={`payment/${this.props.payment.id}/payment_concern`} className="btn btn-sm btn-primary">Having Trouble?</Link>
				</th>
			</tr>
		);
	}
}

export default class PaymentList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			summary: {},
			loadMoreLoader: false,
			loading: false,
			total_count: 0,
			payment_list_count: 0,
			payments: [],
			config: {},
			selectedStatus: "ALL",
		};
	}

	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};

	componentDidMount() {
		this.setLoading(true);
		findPaymentSummary().then(summary => this.setState({summary}));

		findPayments(false, this.state.payment_list_count).then(result => {
			let {payments, total_count} = result;
			this.setState({
				payments: payments,
				total_count: total_count,
				payment_list_count: payments.length
			});
		}).always(() =>{
			this.setLoading(false);
		});

		fetchConfig().then((config) => this.setState({config}));
	}

	loadMoreReports = () => {
		this.setState({
			loadMoreLoader: true
		});
		let is_load_more = true;
		findPayments(is_load_more, this.state.payment_list_count).then(result => {
			let {payments} = result;
			let new_payments = this.state.payments;
			for(let payment of payments){
				new_payments.push(payment);
			}
			this.setState({
				payments: new_payments,
				payment_list_count: new_payments.length,
				loadMoreLoader: false
			});
		});
	};

	// handleStatusChange = (event) => {
	// 	const selectedStatus = event.target.value;
	// 	const actualStatus = selectedStatus === "Payment Status" ? "ALL" : selectedStatus;
	// 	this.setState({ selectedStatus: actualStatus }, this.fetchPaymentData);
	// }
	handleStatusChange = (event) => {
		const selectedStatus = event.target.value;
		this.setState({ selectedStatus }, () => {
			if (selectedStatus !== "ALL") {
				this.setLoading(true);
				findPaymentStatus(selectedStatus)
					.then(result => {
						this.setState({
							payments: result.payments,
							total_count: result.total_count,
							payment_list_count: result.payments.length
						});
					})
					.always(() => {
						this.setLoading(false);
					});
			} else {
				this.setLoading(true); // Set loading state before fetching all payments
				findPayments(false, this.state.payment_list_count)
					.then(result => {
						let { payments, total_count } = result;
						this.setState({
							payments: payments,
							total_count: total_count,
							payment_list_count: payments.length
						});
					})
					.always(() => {
						this.setLoading(false); // Clear loading state after fetching payments
					});
			}
		});
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		else{
			let rows = this.state.payments.map(p => <PaymentRow payment={p} key={p.id}/>);
			if(rows.length > 0){
				let loadMoreLoading;
				if(this.state.loadMoreLoader){
					loadMoreLoading = (<Loading/>);
				}
				let loadMoreButton;
				if(this.state.total_count > this.state.payment_list_count){
					loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreReports}>
						Load More
					</button>);
				}
				const filteredPayments = this.state.selectedStatus === "ALL"
					? this.state.payments
					: this.state.payments.filter(payment => payment.status === this.state.selectedStatus);

				return (
					<div>
						<h2 className="page-header">
							Your Payments
						</h2>
						<p style={{fontSize:"100%"}}>
							<b>Payment terms:</b> Payment will be transferred into your bank account within<b> 45 days from the month end of your report submission </b> since all the reports are checked usually by the client on the month end.
							<br/>
						Once the payment done from FloorWalk it might take 24-48 hours to transfer amount into your bank account depending on the working day and bank holidays. For any payment related queries, please write us at <a href={"mailto:" + this.state.config.ACCOUNTS_EMAIL}>{this.state.config.ACCOUNTS_EMAIL}</a> or you can click <b>Having Trouble?</b> button.
						</p>
						<hr/>
						<table className="table table-bordered table-responsive">
							<thead>
								<tr className="bg-primary">
									<th className="text-center">
										Total Audits Conducted
									</th>
									<th className="text-center">
										Total Fee Payments Transferred
									</th>
									<th className="text-center">
										Total Payments Reimbursement
									</th>
									<th className="text-center">
										Total Payments Pending
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th className="text-center">
										{this.state.summary.total_audits}
									</th>
									<th className="text-center">
										Rs. {this.state.summary.total_transfered}
									</th>
									<th className="text-center">
										Rs. {this.state.summary.total_reimbursement}
									</th>
									<th className="text-center">
										Rs. {this.state.summary.total_pending}
									</th>
								</tr>
							</tbody>
						</table>
						<hr />
						<table className="table table-bordered table-responsive">
							<thead>
								<tr className="bg-primary">
									<th className="text-center">Client</th>
									<th className="text-center">Audit Date</th>
									{/* <th className="text-center">Payment Status</th> */}
									<th className="text-center">
										<div className="dropdown" style={{ display: "inline-block" }}>
											<select className="form-control" value={this.state.selectedStatus} onChange={this.handleStatusChange}>
												<option value="ALL">Payment Status</option>
												<option value="PAID">Paid</option>
												<option value="PENDING">Pending</option>
												<option value="FAILED">Failed</option>
											</select>
										</div>
									</th>
									<th className="text-center">Fee Payment</th>
									<th className="text-center">Reimbursement</th>
									<th className="text-center">Expected Payment Date</th>
									<th className="text-center">Paid on</th>
									<th className="text-center">Action</th>
								</tr>
							</thead>
							<tbody>
								{/* {rows} */}
								{filteredPayments.map(p => <PaymentRow payment={p} key={p.id} />)}
							</tbody>
						</table>
						<div className="text-center">
							{loadMoreLoading}
							{loadMoreButton}
						</div>
					</div>
				);
			} else {
				return (
					<div className="jumbotron">
						<div className="text-center">
							<h2>There are no payments here.</h2>
							<h3>Pending payments will start appearing once your reports have been accepted!</h3>
							<p>We will keep you informed when payments are approved and processed for you</p>
						</div>
						<hr/>
						<div className="text-left">
							<p style={{fontSize:"100%"}}>
								<b>Payment terms:</b> Payment will be transferred into your bank account within<b> 45 days from the month end of your report submission </b> since all the reports are checked usually by the client on the month end.
								<br/>
							Once the payment done from FloorWalk it might take 24-48 hours to transfer amount into your bank account depending on the working day and bank holidays. For any payment related queries, please write us at <a href={"mailto:" + this.state.config.ACCOUNTS_EMAIL}>{this.state.config.ACCOUNTS_EMAIL}</a> or you can click <b>Having Trouble?</b> button.
							</p>
						</div>
					</div>
				);
			}
		}
	}
}
