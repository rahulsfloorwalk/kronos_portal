import React from "react";
import { getProjectAnalytic, getProjectAnalyticYearly } from "../../../service/reports.js";
import { fetchClients } from "../../../service/client.js";

import Loading from "../../../../components/Loading.jsx";
import { getMonthName } from "../../../../utils.js";

export class ProjectAnalyticsCycleWise extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
			year: new Date().getFullYear(),
			client: "",
			cycle:"",
			manager: "",
			loading: false,
			clients: [],
			managers: [],
			cycles: [],
		};
	}

	componentDidMount() {
		fetchClients().then((clients)=>this.setState({clients}));
		this.reload_data(this.state.month, this.state.year, this.state.cycle, this.state.client);
	}

	reload_data = (month, year, manager, cycle, client) => {
		getProjectAnalytic(month, year, manager, cycle, client).then((cycles)=>{
			this.setState({
				"cycles":cycles,
				"loading": false
			});
		});
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	month_changed = (e) => {
		this.setState({
			"month": e.target.value
		});
		this.setLoading(true);
		this.reload_data(e.target.value, this.state.year, this.state.cycle, this.state.client);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, e.target.value, this.state.cycle, this.state.client);
	};

	client_changed = (e) => {
		this.setState({
			"client": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, this.state.cycle, e.target.value);
	};

	render() {
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
		let total_audits = 0;
		let application_count = 0;
		let unique_auditors = 0;
		let new_auditor = 0;
		let row_count = this.state.cycles.length;
		let project_list = this.state.cycles.map((value, index) => {
			total_audits += value.total_audits;
			application_count += value.application_count;
			unique_auditors += value.unique_auditors;
			new_auditor += value.new_auditor;
			return(
				<tr key={index}>
					<td className="text-center">{value.client}</td>
					<td className="text-center">{value.cycle}</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.total_audits}</td>
					<td className="text-center">{value.application_count}</td>
					<td className="text-center">{value.unique_auditors}</td>
					<td className="text-center">{value.new_auditor}</td>
				</tr>
			);
		});
		project_list.push(
			<tr key={row_count+1} style={{borderTop: "1px solid gray", borderBottom: "1px solid gray"}}>
				<th colSpan="4" className="text-center">Total</th>
				<th className="text-center">{total_audits}</th>
				<th className="text-center">{application_count}</th>
				<th className="text-center">{unique_auditors}</th>
				<th className="text-center">{new_auditor}</th>
			</tr>
		);
		return (
			<table className="table table-striped table-hover">
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
						<th className="text-center">Total audits</th>
						<th className="text-center">Applications</th>
						<th className="text-center">Unique auditors</th>
						<th className="text-center">New Auditors</th>
					</tr>
				</thead>
				<tbody>
					{project_list}
				</tbody>
			</table>
		);
	}
}




export class ProjectAnalyticsMonthWise extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			year: new Date().getFullYear(),
			loading: false,
			cycles: [],
		};
	}

	componentDidMount() {
		this.reload_data(this.state.year);
	}

	reload_data = (year) => {
		getProjectAnalyticYearly(year).then((cycles)=>{
			this.setState({
				"cycles":cycles,
				"loading": false
			});
		});
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(e.target.value);
	};

	render() {
		if(this.state.loading){
			return <Loading/>;
		}
		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(<option key={i} value={year-i}>{year-i}</option>);
		}

		let total_audits = 0;
		let application_count = 0;
		let unique_auditors = 0;
		let new_auditor_count = 0;
		let row_count = this.state.cycles.length;

		let project_list = this.state.cycles.map((value, index) => {
			total_audits += value.total_audits;
			application_count += value.application_count;
			unique_auditors += value.unique_auditors;
			new_auditor_count += value.new_auditor_count;
			return(
				<tr key={index}>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.total_audits}</td>
					<td className="text-center">{value.application_count}</td>
					<td className="text-center">{value.unique_auditors}</td>
					<td className="text-center">{value.new_auditor_count}</td>
				</tr>
			);
		});
		project_list.push(
			<tr key={row_count+1} style={{borderTop: "1px solid gray", borderBottom: "1px solid gray"}}>
				<th colSpan="2" className="text-center">Total</th>
				<th className="text-center">{total_audits}</th>
				<th className="text-center">{application_count}</th>
				<th className="text-center">{unique_auditors}</th>
				<th className="text-center">{new_auditor_count}</th>
			</tr>
		);
		return (
			<table className="table table-striped table-hover">
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
						<th className="text-center">Total audits</th>
						<th className="text-center">Applications</th>
						<th className="text-center">Unique auditors</th>
						<th className="text-center">New Auditors</th>
					</tr>
				</thead>
				<tbody>
					{project_list}
				</tbody>
			</table>
		);
	}
}
