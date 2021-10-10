import React, { Component } from "react";

import { getProjectManagerReports } from "../../service/reports.js";
import { findManagers } from "../../service/manager.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class ManagerWiseProfitibilityReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			manager: "",
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
			year: new Date().getFullYear()
		};
	}

	componentDidMount(){
		findManagers().then((managers) => {
			this.setState({
				managers
			});
		});
		this.reload_data(this.state.month, this.state.year, this.state.manager);
	}

	reload_data = (month, year, manager) => {
		getProjectManagerReports(month, year, manager).then((reports)=> this.setState({
			reports
		}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.reload_data(e.target.value, this.state.year, this.state.manager);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(this.state.month, e.target.value, this.state.manager);
	};

	manager_changed = (e) => {
		this.setState({
			"manager": e.target.value
		});
		this.reload_data(this.state.month, this.state.year, e.target.value);
	};

	render(){
		if(! this.state.reports){
			return <Loading/>;
		}
		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(<option key={i} value={year-i}>{year-i}</option>);
		}

		let total_audit_count = 0;
		let total_revenue = 0;
		let total_profitability = 0;
		let total_profitability_per = 0;
		let total_audit_count_per = 0;
		let profitability_row_count = 0;
		let audit_row_count = 0;

		const manager_option_list = this.state.managers.map((m,i) => <option key={i} value={m.id}>{m.email}</option>);

		let report_blocks = this.state.reports.map((value,index) => {
			total_audit_count += value.audit_count;
			total_revenue += value.revenue;
			total_profitability += value.profitability;
			total_profitability_per += value.profitability_per;
			total_audit_count_per += value.audit_count_per;
			profitability_row_count += value.profitability ? 1 : 0;
			audit_row_count += value.audit_count ? 1 : 0;

			return (
				<tr key={index}>
					<td className="text-center"><small>{value.manager_email}</small></td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.audit_count}</td>
					<td className="text-center">{value.revenue}</td>
					<td className="text-center">{value.profitability}</td>
					<td className="text-center">{value.profitability_per}%</td>
					<td className="text-center">{value.audit_count_per}%</td>
				</tr>
			);
		});
		let total_profitability_per_avg = profitability_row_count > 0 ? total_profitability_per / profitability_row_count : 0;
		let total_audit_count_per_avg = audit_row_count > 0 ? total_audit_count_per / audit_row_count : 0;
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									<select name="manager" className="form-control" value={this.state.manager} onChange={this.manager_changed}>
										<option value="">Select manager</option>
										{manager_option_list}
									</select>
								</th>
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
								<th className="text-center">Audits Count</th>
								<th className="text-center">Revenue</th>
								<th className="text-center">Profitability</th>
								<th className="text-center">% Profitability</th>
								<th className="text-center">% Audits Count</th>
							</tr>
						</thead>
						<tbody>
							{report_blocks}
							<tr>
								<td className="text-center" colSpan="3">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_audit_count}</b></td>
								<td className="text-center"><b>{total_revenue}</b></td>
								<td className="text-center"><b>{total_profitability}</b></td>
								<td className="text-center"><b>{total_profitability_per_avg.toFixed(1)}%</b></td>
								<td className="text-center"><b>{total_audit_count_per_avg.toFixed(1)}%</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

