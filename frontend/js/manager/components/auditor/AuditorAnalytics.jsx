import React from "react";
import { getAuditorSummary } from "../../service/auditor_stats";

// import Loading from "../../../components/Loading.jsx";
import { ResponsiveContainer, PieChart, BarChart, CartesianGrid, XAxis, YAxis, Bar, Pie, Cell, Tooltip, Legend, LabelList } from "recharts";
import { getMonthName } from "../../../utils";
import ProjectAnalytics from "../reports/ProjectAnalytics.jsx";

export default class AuditorAnalytics extends React.Component {
	state = {
		state_data: [],
		gender_data: [],
		monthly_auditors: []
	};

	componentDidMount() {
		getAuditorSummary().done((summary)=>{
			this.setState(summary);
		});
	}

	getColorArray = (num) => {
		var result = [];
		for (var i = 0; i < num; i += 1) {
			var letters = "0123456789ABCDEF".split("");
			var color = "#";
			for (var j = 0; j < 6; j += 1) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			result.push(color);
		}
		return result;
	};

	render() {
		this.state.age_data ? this.state.age_data.sort((a, b) => (a.age > b.age ? 1 : -1)) : [];
		let colors = this.getColorArray(this.state.state_data.length);

		let monthly_list = this.state.monthly_auditors.map((value, index) => {
			return(
				<tr key={index}>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.new_reg}</td>
					<td className="text-center">{value.verified_count}</td>
				</tr>
			);
		});

		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Total auditors</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.total_count}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Active auditors</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.active_count}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Last 7 days registration</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.last_week_reg}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Today new auditors</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.today_new_reg}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Active unused auditors</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.auditor_never_used}
							</div>
						</div>
					</div>
				</div>
				<hr/>
				<div className="row col-md-12">
					<div className="col-md-4">
						<h4 className="text-center"><b>Gender wise auditor count</b></h4>
						<ResponsiveContainer width="100%" aspect={4 / 3}>
							<PieChart width={630} height={200}>
								<Pie dataKey="count" nameKey="gender" startAngle={360} endAngle={0} innerRadius={50} outerRadius={100} fill="#8884d8" data={this.state.gender_data} label>
									{
										this.state.gender_data.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={colors[index]} ><LabelList dataKey="gender" position="top" /></Cell>
										))
									}
								</Pie>
								<Tooltip/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="col-md-8">
						<h4 className="text-center"><b>Age wise auditor count</b></h4>
						<ResponsiveContainer width="100%" aspect={8 / 3}>
							<BarChart width={730} height={250} data={this.state.age_data}>
								<CartesianGrid strokeDasharray="1 1" />
								<XAxis dataKey="age" name="Age" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="count" nameKey="Age" name="Count" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="row col-md-12">
					<hr/>
					<div className="col-md-5">
						<h4 className="text-center"><b>State wise auditor count</b></h4>
						<ResponsiveContainer width="100%" aspect={5 / 3}>
							<PieChart width={930} height={400}>
								<Pie dataKey="count" nameKey="state" startAngle={360} endAngle={0} innerRadius={50} outerRadius={100} fill="#8884d8" data={this.state.state_data} label>
									{
										this.state.state_data.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={colors[index]}/>
										))
									}
								</Pie>
								<Tooltip/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="col-md-7">
						<table className="table table-striped table-hover">
							<thead>
								<tr>
									<th className="text-center">Month</th>
									<th className="text-center">Year</th>
									<th className="text-center">New Registrations</th>
									<th className="text-center">Verified auditors</th>
								</tr>
							</thead>
							<tbody>
								{monthly_list}
							</tbody>
						</table>
					</div>
				</div>
				<div className="col-md-12">
					<h3 className="font-weight-bold">Project analytics</h3>
					<hr/>
					<ProjectAnalytics />
				</div>
			</div>
		);
	}
}
