import React, { Component } from "react";

import { getClientProfitabilityReports } from "../../service/reports.js";
import { fetchClients } from "../../service/client.js";

import Loading from "../../../components/Loading.jsx";

export default class ClientWiseProfitibilityReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			year: new Date().getFullYear(),
			client: "",
		};
	}

	componentDidMount(){
		fetchClients().done((clients)=>this.setState({clients}));
		this.reload_data(this.state.year, this.state.client);
	}

	reload_data = (year, client) => {
		getClientProfitabilityReports(year, client).then((reports)=> this.setState({
			reports
		}));
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.reload_data(e.target.value, this.state.client);
	};

	client_changed = (e) => {
		this.setState({
			"client": e.target.value
		});
		this.reload_data(this.state.year, e.target.value);
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

		const client_option_list = [];
		for(let c of this.state.clients) {
			client_option_list.push(<option value={c.id} key={c.id}>{c.name}</option>);
		}

		let total_count = 0;
		const map = new Map();

		let report_blocks = this.state.reports.map((value, index) => {

			let month_data = value.month_list.map((val, index) => {

				if(!map.has(val.month)){
					map.set(val.month, val.profit);
				}
				else{
					let profit = map.get(val.month);
					map.set(val.month, profit + val.profit);
				}

				return <td key={index} className="text-center">{val.profit}</td>;
			});

			total_count += value.total_profit;

			return (
				<tr key={index}>
					<td className="text-center"><small>{value.client.name}</small></td>
					<td className="text-center">{this.state.year}</td>
					{month_data}
					<td className="text-center">{value.total_profit}</td>
				</tr>
			);
		});

		let total_list = [];
		map.forEach(function(value, key) {
			total_list.push(<td key={key} className="text-center"><b>{value}</b></td>);
		});

		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									<select name="client" className="form-control" value={this.state.client} onChange={this.client_changed}>
										<option value="">Select client</option>
										{client_option_list}
									</select>
								</th>
								<th className="text-center">
									<select name="year" className="form-control" value={this.state.year} onChange={this.year_changed}>
										{year_option_list}
									</select>
								</th>
								<th className="text-center">January</th>
								<th className="text-center">February</th>
								<th className="text-center">March</th>
								<th className="text-center">April</th>
								<th className="text-center">May</th>
								<th className="text-center">June</th>
								<th className="text-center">July</th>
								<th className="text-center">August</th>
								<th className="text-center">September</th>
								<th className="text-center">October</th>
								<th className="text-center">November</th>
								<th className="text-center">December</th>
								<th className="text-center">Total</th>
							</tr>
						</thead>
						<tbody>
							{report_blocks}
							<tr>
								<td className="text-center" colSpan="2"><b>Total</b></td>
								{total_list}
								<td className="text-center"><b>{total_count}</b></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}

