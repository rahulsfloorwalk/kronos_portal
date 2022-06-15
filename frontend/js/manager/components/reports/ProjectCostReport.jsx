import React, { Component } from "react";
import { Link } from "react-router";
import {url}  from "../../../../config.js";

import { getProjectCostReports } from "../../service/reports.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class ProjectCostReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			client: "",
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
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
		this.reload_data(this.state.month, this.state.year, this.state.client);
	}

	reload_data = (month, year, client) => {
		getProjectCostReports(month, year, client).then((active_cycles)=> this.setState({
			active_cycles
		}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.reload_data(e.target.value, this.state.year, this.state.client);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(this.state.month, e.target.value, this.state.client);
	};

	client_changed = (e) => {
		this.setState({
			"client": e.target.value
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

		let total_planned_audits = 0;
		let total_conducted_audit = 0;
		let total_audit_complete_per = 0;
		let total_budget_utilized = 0;
		let total_estimated_cost = 0;
		let total_actual_cost = 0;
		let total_variation = 0;
		let row_count = 0;
		const client_option_list = [];
		const map = new Map();

		let audit_cycle_blocks = this.state.active_cycles.map((value,index) => {
			let linkTo = `audit_cycle/${value.id}/questionnaire`;
			total_planned_audits += value.planned_audit;
			total_conducted_audit += value.conducted_audit;
			total_audit_complete_per += value.audit_complete_per;
			total_estimated_cost += value.estimated_cost;
			total_actual_cost += value.actual_cost;
			total_budget_utilized += value.budget_utilized;
			total_variation += value.variation;
			row_count += 1;

			if(!map.has(value.client_id)){
				map.set(value.client_id, true);
				client_option_list.push(<option value={value.client_id} key={index}>{value.client}</option>);
			}

			return (
				<tr key={index}>
					<td className="text-center"><small>{value.client}</small></td>
					<td className="text-center">{value.name}</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.planned_audit}</td>
					<td className="text-center">{value.conducted_audit}</td>
					<td className="text-center">{value.audit_complete_per}</td>
					<td className="text-center">{value.budget_utilized}</td>
					<td className="text-center">{value.estimated_cost}</td>
					<td className="text-center">{value.actual_cost}</td>
					<td className="text-center">{value.variation}</td>
					<td className="text-center">
						<Link to={linkTo} className="btn btn-default pull-center" target="_blank">View</Link>
					</td>
				</tr>
			);
		});
		let total_audit_complete_per_avg = row_count > 0 ? total_audit_complete_per / row_count : 0;
		let export_button = <a href={url.api_base_path + `manager/reports/project_cost/export?month=${this.state.month}&year=${this.state.year}&client=${this.state.client}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm pull-right">Export Report</a>;
		return (
			<div className="row">
				<div className="col-md-12">
					{export_button}
					<br/><br/>
				</div>
				<div className="col-md-12 table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									<select name="client" className="form-control" value={this.state.client} onChange={this.client_changed}>
										<option value="">Select client</option>
										{client_option_list}
									</select>
								</th>
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
								<th className="text-center">Planned Audits</th>
								<th className="text-center">Conducted Audits</th>
								<th className="text-center">% Completion</th>
								<th className="text-center">Budget Utilized</th>
								<th className="text-center">Estimated Cost</th>
								<th className="text-center">Actual Cost</th>
								<th className="text-center">Variation</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{audit_cycle_blocks}
							<tr>
								<td className="text-center" colSpan="4">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_planned_audits}</b></td>
								<td className="text-center"><b>{total_conducted_audit}</b></td>
								<td className="text-center"><b>{total_audit_complete_per_avg.toFixed(1)}</b></td>
								<td className="text-center"><b>{total_budget_utilized}</b></td>
								<td className="text-center"><b>{total_estimated_cost}</b></td>
								<td className="text-center"><b>{total_actual_cost}</b></td>
								<td className="text-center"><b>{total_variation}</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

