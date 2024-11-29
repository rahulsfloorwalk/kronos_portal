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
			loading: false,
			total_client_count: 0,
			loadMoreLoader: false,
			reports: [],
			clients: []
		};
	}

	componentDidMount(){
		fetchClients().done((clients)=>this.setState({clients}));
		this.reload_data(this.state.year, this.state.client);
	}

	reload_data = (year, client) => {
		let last_client_id = "";
		this.setLoading(true);
		getClientProfitabilityReports(year, client, last_client_id).then((reports)=>{
			let newreport = reports.client_list.filter(client=>client.month_list.some(month=>month.profit!==0));
			this.setState({
			// reports: reports.client_list,
				reports: newreport,
				total_client_count: reports.total_client_count,
				loading: false,
			});});
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(e.target.value, this.state.client);
	};

	client_changed = (e) => {
		this.setState({
			"client": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.year, e.target.value);
	};

	// loadMoreReports = () => {
	// 	this.setState({
	// 		loadMoreLoader: true
	// 	});
	// 	let lastClientId= this.state.reports[this.state.reports.length-1].client.id;
	// 	let year = this.state.year;
	// 	let client = this.state.client;
	// 	getClientProfitabilityReports(year, client, lastClientId).then((reports)=> {
	// 		let newReports = this.state.reports;
	// 		for(let client_report of reports.client_list){
	// 			newReports.push(client_report);
	// 		}
	// 		this.setState({
	// 			reports: newReports,
	// 			loadMoreLoader: false
	// 		});
	// 	});
	// };

	render(){
		// let loadMoreButton;
		// let loadMoreLoading;
		// if(this.state.loadMoreLoader){
		// 	loadMoreLoading = (<Loading/>);
		// }
		// if(this.state.reports){
		// 	if(this.state.reports.length !== this.state.total_client_count){
		// 		loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreReports}>
		// 			Load More
		// 		</button>);
		// 	}
		// }

		if(this.state.loading){
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
							{/* {report_blocks} */}
							{this.state.reports.length === 0 ?
								<tr>
									<td colSpan="15" className="text-center no-data-row">No Data Found</td>
								</tr>: report_blocks}
							<tr>
								<td className="text-center" colSpan="2"><b>Total</b></td>
								{total_list}
								<td className="text-center"><b>{total_count}</b></td>
							</tr>
						</tbody>
					</table>
				</div>
				{/* <div className="text-center">
					{loadMoreLoading}
					{ this.state.loadMoreLoader ? null : loadMoreButton }
				</div> */}
			</div>
		);
	}
}

