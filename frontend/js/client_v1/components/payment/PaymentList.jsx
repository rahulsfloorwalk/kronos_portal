import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { getClientPayments } from "../../service/payment.js";
import { fetchAccountBalance } from "../../actions/client.js";
import PaymentStatusLabel from "../../../components/PaymentStatusLabel.jsx";
import { DownloadAlt } from "../../../components/Icons.jsx";
import { url } from "../../../../config.js";


class PaymentRow extends React.Component{
	static propTypes = {
		payment: PropTypes.object,
		client_id: PropTypes.number
	};

	render(){
		let {added_on, amount, status, invoice_number, id} = this.props.payment;
		let base = url.api_base_path + `client_v1/payment/${this.props.client_id}/${id}/invoice`;
		return (
			<tr>
				<td>{invoice_number}</td>
				<td>{moment(added_on).format(momentDateFormat)}</td>
				<td>&#8377; {amount}</td>
				<td><PaymentStatusLabel status={status} /></td>
				<td>
					<a href={base}><DownloadAlt/></a>
				</td>
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
			rows.push(<PaymentRow payment={row} key={row.id} client_id={this.props.client.id} />);
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
								<th></th>
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