import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { getClientPayments } from "../../service/payment.js";
import { fetchAccountBalance } from "../../actions/client.js";
import PaymentStatusLabel from "../../../components/PaymentStatusLabel.jsx";


class PaymentRow extends React.Component{
	static propTypes = {
		payment: PropTypes.object,
	};

	render(){
		let {added_on, amount, status, invoice_id} = this.props.payment;
		return (
			<tr>
				<td>{invoice_id}</td>
				<td>{moment(added_on).format(momentDateFormat)}</td>
				<td>&#8377; {amount}</td>
				<td><PaymentStatusLabel status={status} /></td>
			</tr>
		);
	}
}


class PaymentList extends React.Component {
	static propTypes = {
		client: PropTypes.object,
		dispatch: PropTypes.func
	};

	state = {
		payments: [],
	};

	componentDidMount(){
		if(this.props.client.id){
			getClientPayments(this.props.client.id).then((payments) => {
				this.setState({
					payments,
				});
			});
		}
	}

	componentWillReceiveProps(ownProps){
		ownProps.dispatch(fetchAccountBalance());
		getClientPayments(ownProps.client.id).then((payments) => {
			this.setState({
				payments,
			});
		});
	}

	render(){

		let rows = [];
		for(let row of this.state.payments){
			rows.push(<PaymentRow payment={row} key={row.id} />);
		}
		if(rows.length == 0){
			return(
				<div className="container">
					<h1>Invoice List</h1><br/>
					<div className="form-group">
						<div className="jumbotron text-center">
							<h3>Invoices not found</h3>
						</div>
					</div>
				</div>
			);
		}
		return (
			<div className="container">
				<h1>Invoice List</h1><br/>
				<div className="row col-md-12">
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Invoice Number</th>
								<th>Payment Date</th>
								<th>Amount</th>
								<th>Payment Status</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		client: store.client
	};
};

export default connect(mapStoreToProps)(PaymentList);