import React, { Component } from "react";

import { getBillingReports } from "../../service/reports.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class BillingReport extends Component{
	constructor(props){
		super(props);
		this.state = {
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
		this.reload_data(this.state.month, this.state.year);
	}

	reload_data = (month, year) => {
		getBillingReports(month, year).then((active_cycles)=> this.setState({
			active_cycles
		}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.reload_data(e.target.value, this.state.year);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(this.state.month, e.target.value);
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

		let total_audits_conducted = 0;
		let total_price_per_audit = 0;
		let total_system_cost = 0;
		let total_revenue = 0;
		let total_gst = 0;
		let audit_cycle_blocks = this.state.active_cycles.map((value, index) => {
			total_audits_conducted += value.audit_conducted;
			total_price_per_audit += value.charge_per_audit;
			total_system_cost += value.system_cost;
			total_revenue += value.revenue;
			total_gst += value.gst;
			return (
				<tr key={index}>
					<td className="text-center"><small>{value.client}</small></td>
					<td className="text-center">{value.name}</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.audit_conducted}</td>
					<td className="text-center">{value.charge_per_audit}</td>
					<td className="text-center">{value.system_cost}</td>
					<td className="text-center">{value.revenue}</td>
					<td className="text-center">{value.gst}</td>
				</tr>
			);
		});
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">Client</th>
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
								<th className="text-center">Total Audits Conducted</th>
								<th className="text-center">Price Per Audit</th>
								<th className="text-center">System Cost</th>
								<th className="text-center">Total Billing</th>
								<th className="text-center">GST</th>
							</tr>
						</thead>
						<tbody>
							{audit_cycle_blocks}
							<tr>
								<td className="text-center" colSpan="4">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_audits_conducted}</b></td>
								<td className="text-center"><b>{total_price_per_audit}</b></td>
								<td className="text-center"><b>{total_system_cost}</b></td>
								<td className="text-center"><b>{total_revenue}</b></td>
								<td className="text-center"><b>{total_gst}</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

