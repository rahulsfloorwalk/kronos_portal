import React, { Component } from "react";

import { getQAReports } from "../../service/reports.js";
import { findModerators } from "../../service/moderator.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class QAReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			qa: "",
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
			year: new Date().getFullYear(),
			loading: false,
			qas: [],
			reports: []
		};
	}

	componentDidMount(){
		findModerators().then((qas) => {
			if(qas){
				let qa_list = qas.filter(qa => qa.is_active === true);
				this.setState({
					qas: qa_list
				});
			}
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, this.state.qa);
	}

	reload_data = (month, year, qa) => {
		getQAReports(month, year, qa).then((reports)=> this.setState({
			reports: reports,
			loading: false
		}));
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.setLoading(true);
		this.reload_data(e.target.value, this.state.year, this.state.qa);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, e.target.value, this.state.qa);
	};

	qa_changed = (e) => {
		this.setState({
			"qa": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, e.target.value);
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(<option key={i} value={year-i}>{year-i}</option>);
		}

		let total_audit_count = 0;
		let total_audit_count_per = 0;
		let total_audit_count_per_day = 0;

		const qa_option_list = this.state.qas.map((m,i) => <option key={i} value={m.id}>{m.email}</option>);

		let report_blocks = this.state.reports.map((value,index) => {
			total_audit_count += value.audit_count;
			total_audit_count_per += value.report_per;
			total_audit_count_per_day += value.report_per_day;


			return (
				<tr key={index}>
					<td className="text-center"><small>{value.qa_email}</small></td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.audit_count}</td>
					<td className="text-center">{value.report_per}%</td>
					<td className="text-center">{value.report_per_day}</td>
				</tr>
			);
		});
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									<select name="qa" className="form-control" value={this.state.qa} onChange={this.qa_changed}>
										<option value="">Select QA</option>
										{qa_option_list}
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
								<th className="text-center">Report Count</th>
								<th className="text-center">% Report Count</th>
								<th className="text-center">Avg. Reports/Day</th>
							</tr>
						</thead>
						<tbody>
							{report_blocks}
							<tr>
								<td className="text-center" colSpan="3">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_audit_count}</b></td>
								<td className="text-center"><b>{total_audit_count_per.toFixed(1)}%</b></td>
								<td className="text-center"><b>{total_audit_count_per_day.toFixed(1)}</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

