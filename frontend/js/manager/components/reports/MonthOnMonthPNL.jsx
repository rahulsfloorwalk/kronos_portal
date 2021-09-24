import React, { Component } from "react";

import { getMonthlyPNLReports } from "../../service/reports.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";

export default class MonthOnMonthPNL extends Component {

	constructor(props){
		super(props);
		this.state = {
			year: new Date().getFullYear()
		};
	}

	componentDidMount(){
		this.reload_data(this.state.year);
	}

	reload_data = (year) => {
		getMonthlyPNLReports(year).then((reports)=> this.setState({
			reports
		}));
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(e.target.value);
	};

	render() {
		if(! this.state.reports){
			return <Loading/>;
		}

		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(<option key={i} value={year-i}>{year-i}</option>);
		}

		let total_sales = 0;
		let total_auditor_payment = 0;
		let total_gross_margin = 0;
		let total_gross_margin_per = 0;
		let row_count = 0;
		const report_rows = this.state.reports.map((value, index) => {
			total_sales += value.sales;
			total_auditor_payment += value.auditor_payment;
			total_gross_margin += value.gross_margin;
			total_gross_margin_per += value.gross_margin_per;
			row_count += value.gross_margin ? 1 : 0;
			return (
				<tr key={index}>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.sales}</td>
					<td className="text-center">{value.auditor_payment}</td>
					<td className="text-center">{value.gross_margin}</td>
					<td className="text-center">{value.gross_margin_per}%</td>
				</tr>
			);
		});
		let gross_margin_per = row_count > 0 ? (total_gross_margin_per / row_count) : 0;
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									Month
								</th>
								<th className="text-center">
									<select name="year" className="form-control" value={this.state.year} onChange={this.year_changed}>
										{year_option_list}
									</select>
								</th>
								<th className="text-center">Sales</th>
								<th className="text-center">Auditor Cost</th>
								<th className="text-center">Gross Margin</th>
								<th className="text-center">Gross Margin %</th>
							</tr>
						</thead>
						<tbody>
							{report_rows}
							<tr>
								<td className="text-center" colSpan="2">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_sales}</b></td>
								<td className="text-center"><b>{total_auditor_payment}</b></td>
								<td className="text-center"><b>{total_gross_margin}</b></td>
								<td className="text-center"><b>{gross_margin_per.toFixed(1)}%</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}
