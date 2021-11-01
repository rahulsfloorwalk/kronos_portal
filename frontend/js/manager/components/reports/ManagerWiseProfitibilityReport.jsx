import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { getProjectManagerReports } from "../../service/reports.js";
import { findManagers, findById } from "../../service/manager.js";
import { filterAuditCycleByManager } from "../../service/audit_cycle.js";

import { getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";
import Modal from "../../../components/Modal.jsx";

export default class ManagerWiseProfitibilityReport extends Component{
	static propTypes = {
		children: PropTypes.node,
	};

	constructor(props){
		super(props);
		this.state = {
			manager: "",
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
			year: new Date().getFullYear(),
			loading: false,
			managers: [],
			reports: []
		};
	}

	componentDidMount(){
		findManagers().then((managers) => {
			if(managers){
				let manager_list = managers.filter(manager => manager.is_active === true);
				this.setState({
					managers: manager_list
				});
			}
		});
		this.setLoading(true);
		this.reload_data(this.state.month, this.state.year, this.state.manager);
	}

	reload_data = (month, year, manager) => {
		getProjectManagerReports(month, year, manager).then((reports)=> this.setState({
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
		this.reload_data(e.target.value, this.state.year, this.state.manager);
	};

	year_changed = (e) => {
		this.setState({
			"year": e.target.value
		});
		this.setLoading(true);
		this.reload_data(this.state.month, e.target.value, this.state.manager);
	};

	manager_changed = (e) => {
		this.setState({
			"manager": e.target.value
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

		let total_planned_audit = 0;
		let total_audit_count = 0;
		let total_revenue = 0;
		let total_profitability = 0;
		let total_profitability_per = 0;
		let total_audit_count_per = 0;
		let profitability_rows = 0;
		let audit_count_rows = 0;

		const manager_option_list = this.state.managers.map((m,i) => <option key={i} value={m.id}>{m.email}</option>);

		let report_blocks = this.state.reports.map((value,index) => {
			let linkTo = `reports/manager_profit/${value.manager_id}/${value.month}/${value.year}/audit_cycle`;
			total_audit_count += value.audit_count;
			total_revenue += value.revenue;
			total_profitability += value.profitability;
			total_profitability_per += value.profitability_per;
			total_audit_count_per += value.audit_count_per;
			total_planned_audit += value.planned_audit;

			profitability_rows += value.profitability_per ? 1 : 0;
			audit_count_rows += value.audit_count_per ? 1 : 0;

			return (
				<tr key={index}>
					<td className="text-center"><small>{value.manager_email}</small></td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">{value.planned_audit}</td>
					<td className="text-center">{value.audit_count}</td>
					<td className="text-center">{value.revenue}</td>
					<td className="text-center">{value.profitability}</td>
					<td className="text-center">{value.profitability_per}%</td>
					<td className="text-center">{value.audit_count_per}%</td>
					<td className="text-center">
						<Link to={linkTo} className="btn btn-default pull-center">View</Link>
					</td>
				</tr>
			);
		});

		total_profitability_per = profitability_rows > 0 ? total_profitability_per / profitability_rows : 0;
		total_audit_count_per = audit_count_rows > 0 ? total_audit_count_per / audit_count_rows : 0;
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
								<th className="text-center">Planned Audits</th>
								<th className="text-center">Audits Count</th>
								<th className="text-center">Revenue</th>
								<th className="text-center">Profitability</th>
								<th className="text-center">% Profitability</th>
								<th className="text-center">% Audits Count</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{report_blocks}
							<tr>
								<td className="text-center" colSpan="3">
									<b>Total</b>
								</td>
								<td className="text-center"><b>{total_planned_audit}</b></td>
								<td className="text-center"><b>{total_audit_count}</b></td>
								<td className="text-center"><b>{total_revenue}</b></td>
								<td className="text-center"><b>{total_profitability}</b></td>
								<td className="text-center"><b>{total_profitability_per.toFixed(1)}%</b></td>
								<td className="text-center"><b>{total_audit_count_per.toFixed(1)}%</b></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
				{this.props.children}
			</div>
		);
	}
}





export class ManagerReportModel extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			managerId: PropTypes.oneOfType([PropTypes.number,PropTypes.string]),
			month: PropTypes.string,
			year: PropTypes.string,
		}),
		router: PropTypes.shape({
			goBack: PropTypes.func.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		manager:"",
		audit_cycle: []
	};

	componentDidMount() {
		this.setState({
			loading: true,
		});
		findById(this.props.params.managerId).then((manager)=>{
			this.setState({
				manager
			});
		});
		filterAuditCycleByManager(this.props.params.managerId, this.props.params.month, this.props.params.year).then((audit_cycle) => {
			this.setState({
				audit_cycle,
				loading: false
			});
		});
	}

	render() {
		let audit_cycle_rows = this.state.audit_cycle.map((value,index) => {
			let linkTo = `audit_cycle/${value.id}/questionnaire`;
			return (
				<tr key={index}>
					<td className="text-center"><small>{value.name}</small></td>
					<td className="text-center">{value.completed_audit_count}</td>
					<td className="text-center">
						<Link to={linkTo} className="btn btn-default pull-center" target="__blank">View</Link>
					</td>
				</tr>
			);
		});

		return (
			<Modal modalTitle="Audit cycles" size="modal-lg" onClose={this.props.router.goBack}>
				<div>
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">Manager</th>
								<th className="text-center">Month</th>
								<th className="text-center">Year</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th className="text-center">{this.state.manager.email}</th>
								<th className="text-center">{getMonthName(this.props.params.month)}</th>
								<th className="text-center">{this.props.params.year}</th>
							</tr>
						</tbody>
					</table>
				</div>
				{this.state.loading ? <Loading /> :
					<div className="" style={{paddingBottom:"3%"}}>
						<table className="table table-hover table-striped table-bordered table-condensed">
							<thead>
								<tr>
									<th className="text-center">Cycle name</th>
									<th className="text-center">Audit count</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{audit_cycle_rows}
							</tbody>
						</table>
					</div>
				}
			</Modal>
		);
	}
}