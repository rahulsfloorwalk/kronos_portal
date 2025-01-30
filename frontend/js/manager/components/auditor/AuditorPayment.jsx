import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { findPaymentsByUserId,failpay } from "../../service/payment.js";

import Loading from "../../../components/Loading.jsx";
import PaymentStatusLabel from "../../../components/PaymentStatusLabel.jsx";

export default class AuditorPayment extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.string.isRequired,
		}),
		onChange: PropTypes.func,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: true,
			payments: [],
			payButtonMessage: "",
		};
	}

	failpayButtonClicked = (paymentId) => {
		failpay(paymentId).then((payment) => {
			Alert.success("PAYMENT MARKED AS PAID AGAIN");
			this.setState({
				payButtonMessage: "Marked as paid again",
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

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (userId) => {
		this.setLoading(true);
		findPaymentsByUserId(userId).then((payments)=> this.setState({ payments })).always(() => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData(this.props.params.auditorId);
	}

	componentWillReceiveProps = (nextProps) => {
		if( this.props.params.auditorId !== nextProps.params.auditorId){
			this.reloadData(nextProps.params.auditorId);
		}
	};

	render(){
		if( this.state.loading){
			return <Loading/>;
		}
		let paymentRows = this.state.payments.map(p => {
			return (<tr key={p.id}>
				<td>{moment(p.added_on).format(momentDateFormat)}</td>
				<td><big>₹ {p.amount}</big></td>
				<td><PaymentStatusLabel status={p.status}/></td>
				<td>{p.paid_on ? moment(p.paid_on).format(momentDateFormat) : ""}</td>
				<td>{p.comment}</td>
				<td>{p.status === "PAID" && ( <button onClick={() => this.failpayButtonClicked(p.id)} type="button" className="btn btn-default" > Fail & Pay </button> )}</td>
				<td><Link to={`/audit_store/${p.audit_store_id}/report`} className="btn btn-default">View Report</Link></td>
			</tr>);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Payments</h4>
				</div>
				<table className="table table-striped table-hover">
					<tbody>
						<tr>
							<th>Added On</th>
							<th>Amount</th>
							<th>Status</th>
							<th>Paid On</th>
							<th>Comment</th>
							<th>Action</th>
							<th>Report</th>
						</tr>
						{paymentRows}
					</tbody>
				</table>
			</div>
		);
	}
}
