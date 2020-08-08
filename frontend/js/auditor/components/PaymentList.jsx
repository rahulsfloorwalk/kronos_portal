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
						{/* <button className="btn btn-primary btn-xs pull-right">Any Concern?</button> */}
						<Link to={`payment/${this.props.payment.id}/payment_concern`} className="btn btn-primary btn-xs pull-right">Any Concern?</Link>
					</div>
				</div>
				<div className="row hidden-xs hidden-md hidden-lg">
					<div className="col-sm-3">
						<p><big style={{fontSize: "170%"}}><b>₹ {this.props.payment.amount}</b></big></p>
						<p><PaymentStatusLabel status={this.props.payment.status}/></p>
					</div>
					<div className="col-sm-3">
						<p>Added on: <b>{moment(this.props.payment.added_on).format(momentDateFormat)}</b></p>
						{ this.props.payment.paid_on ? <p>Paid on: <b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
					</div>
					<div className="col-sm-4">
						<p>{this.props.payment.comment}</p>
					</div>
					<div className="col-sm-2">
						{/* <button className="btn btn-primary btn-sm pull-right">Any Concern?</button> */}
						<Link to={`payment/${this.props.payment.id}/payment_concern`} className="btn btn-primary btn-sm pull-right">Any Concern?</Link>
					</div>
				</div>
				<div className="row hidden-xs hidden-sm">
					<div className="col-md-2 text-right">
						<big style={{fontSize: "170%"}}><b>₹ {this.props.payment.amount}</b></big>
					</div>
					<div className="col-md-1">
						<p><PaymentStatusLabel status={this.props.payment.status}/></p>
					</div>
					<div className="col-md-2 text-right">
						<p>Added on: <b>{moment(this.props.payment.added_on).format(momentDateFormat)}</b></p>
						{ this.props.payment.paid_on ? <p>Paid on: <b>{moment(this.props.payment.paid_on).format(momentDateFormat)}</b></p> : null }
					</div>
					<div className="col-md-5">
						<p>{this.props.payment.comment}</p>
					</div>
					<div className="col-md-2">
						{/* <button className="btn btn-primary btn-lg">Any Concern?</button> */}
						<Link to={`payment/${this.props.payment.id}/payment_concern`} className="btn btn-primary btn-lg">Any Concern?</Link>
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
}
