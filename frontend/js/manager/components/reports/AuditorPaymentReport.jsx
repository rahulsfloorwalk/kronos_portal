import React, { Component } from "react";
import { Link } from "react-router";

import { getAuditorPaymentReports } from "../../service/reports.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class AuditorPaymentReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			payment: "",
			month: "",
			year: new Date().getFullYear()
		};
	}

	months = {
		"01": "January",
		"02": "February",
		"03": "March",
		"04": "April",
		"05": "May",
		"06": "June",
		"07": "July",
		"08": "August",
		"09": "September",
		"10": "October",
		"11": "November",
		"12": "December",
	};

	componentDidMount(){
		this.reload_data(this.state.month, this.state.year, this.state.payment);
	}

	reload_data = (month, year, payment) => {
		getAuditorPaymentReports(month, year, payment).then((active_cycles)=> this.setState({
			active_cycles
		}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.reload_data(e.target.value, this.state.year, this.state.payment);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(this.state.month, e.target.value, this.state.payment);
	};

	payment_changed = (e) => {
		this.setState({
			"payment": e.target.value
		});
		this.reload_data(this.state.month, this.state.year, e.target.value);
	};

	render(){
		if(! this.state.active_cycles){
			return <Loading/>;
		}
		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(<option key={i} value={year-i}>{year-i}</option>);
		}

		let total_reimbursement = 0;
		let total_earning = 0;
		let total_auditor_payment = 0;
		const audit_cycle_blocks = this.state.active_cycles.map((value, index) => {
			let linkTo = `audit_cycle/${value.id}/questionnaire`;
			total_reimbursement += value.reimbursement;
			total_earning += value.earnings_per_audit;
			total_auditor_payment += value.auditor_payment;
			return (
				<tr key={index}>
					<td className="text-center">
						<small>{value.client}</small>
					</td>
					<td className="text-center">
						{value.name}
					</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.reimbursement}</td>
					<td className="text-center">{value.earnings_per_audit}</td>
					<td className="text-center">{value.auditor_payment}</td>
					<td className="text-center">{value.payment_status}</td>
					<td className="text-center">
						<Link to={linkTo} className="btn btn-default pull-center" target="_blank">View</Link>
					</td>
				</tr>
			);
		});
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">Client{}</th>
								<th className="text-center">Cycle</th>
								<th className="text-center">
									<select name="month" className="form-control" value={this.state.month} onChange={this.month_changed}>
										<option value="">Select month</option>
										<option value="01">January</option>
										<option value="02">February</option>
										<option value="03">March</option>
										<option value="04">April</option>
										<option value="05">May</option>
										<option value="06">June</option>
										<option value="07">July</option>
										<option value="08">August</option>
										<option value="09">September</option>
										<option value="10">October</option>
										<option value="11">November</option>
										<option value="12">December</option>
									</select>
								</th>
								<th className="text-center">
									<select name="year" className="form-control" value={this.state.year} onChange={this.year_changed}>
										{year_option_list}
									</select>
								</th>
								<th className="text-center">Total Audit Reimbursement</th>
								<th className="text-center">Total audit fees</th>
								<th className="text-center">Total Auditor Payment</th>
								<th className="text-center">
									<select name="payment" className="form-control" value={this.state.payment} onChange={this.payment_changed}>
										<option value="">Select payment status</option>
										<option value="paid">Paid</option>
										<option value="pending">Pending</option>
									</select>
								</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{audit_cycle_blocks}
							<tr>
								<td className="text-center" colSpan="4"><b>Total</b></td>
								<td className="text-center"><b>{total_reimbursement}</b></td>
								<td className="text-center"><b>{total_earning}</b></td>
								<td className="text-center"><b>{total_auditor_payment}</b></td>
								<td></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

