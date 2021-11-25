import React from "react";
import { getProjectAnalytic } from "../../service/auditor_stats";
import { fetchClients } from "../../service/client.js";
import { findManagers } from "../../service/manager.js";

import Loading from "../../../components/Loading.jsx";
import { getMonthName } from "../../../utils";

export default class ProjectAnalytics extends React.Component {
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
		fetchClients().done((clients)=>this.setState({clients}));
		findManagers().then((managers) => {
			if(managers){
				let manager_list = managers.filter(manager => manager.is_active === true);
				this.setState({
					managers: manager_list
				});
			}
		});
		this.reload_data(this.state.month, this.state.year, this.state.manager, this.state.cycle, this.state.client);
	}

	reload_data = (month, year, manager, cycle, client) => {
		getProjectAnalytic(month, year, manager, cycle, client).done((cycles)=>{
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
		this.reload_data(e.target.value, this.state.year, this.state.manager, this.state.cycle, this.state.client);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, e.target.value, this.state.manager, this.state.cycle, this.state.client);
	};

	manager_changed = (e) => {
		this.setState({
			"manager": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, e.target.value, this.state.cycle, this.state.client);
	};

	client_changed = (e) => {
		this.setState({
			"client": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, this.state.manager, this.state.cycle, e.target.value);
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

		const manager_option_list = this.state.managers.map((m,i) => <option key={i} value={m.id}>{m.email}</option>);

		const client_option_list = [];
		for(let c of this.state.clients) {
			client_option_list.push(<option value={c.id} key={c.id}>{c.name}</option>);
		}

		let project_list = this.state.cycles.map((value, index) => {
			let manager_user = value.manager.map((val, ind) => {
				return(
					<ul key={ind}>
						<li>{val}</li>
					</ul>
				);
			});
			return(
				<tr key={index}>
					<td className="text-center">{value.client}</td>
					<td className="text-center">{value.cycle}</td>
					<td>{manager_user}</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.total_audits}</td>
					<td className="text-center">{value.application_count}</td>
					<td className="text-center">{value.unique_auditors}</td>
					<td className="text-center">{value.last_year_new_auditor}</td>
				</tr>
			);
		});
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
						<th className="text-center">Total audits</th>
						<th className="text-center">Applications</th>
						<th className="text-center">Unique auditors</th>
						<th className="text-center">New Auditors <br/><small>(In recent year)</small></th>
					</tr>
				</thead>
				<tbody>
					{project_list}
				</tbody>
			</table>
		);
	}
}
