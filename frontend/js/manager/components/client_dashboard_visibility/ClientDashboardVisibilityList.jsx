import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Pencil, Check, Cross } from "../../../components/Icons.jsx";

import { fetchClientDashboardVisibility } from "../../service/client_manager.js";

const DASHBOARD_ITEMS = [
	{
		key: "latest_audit_cycle_score",
		label: "Latest Audit Cycle Score",
	},
	{
		key: "upcoming_audits",
		label: "Upcoming Audits",
	},
	{
		key: "net_promoter_score",
		label: "Net Promoter Score",
	},
	{
		key: "section_summary",
		label: "Section Summary",
	},
	{
		key: "improvement_areas_based_on_observation",
		label: "Improvement areas based on observation",
	},
	{
		key: "overall_high_performance_store",
		label: "Overall High Performance Store",
	},
	{
		key: "overall_high_performance_city",
		label: "Overall High Performance City",
	},
	{
		key: "branch_performance",
		label: "Branch performance",
	},
	{
		key: "overall_low_performance_store",
		label: "Overall Low Performance Store",
	},
	{
		key: "overall_low_performance_city",
		label: "Overall Low Performance City",
	},
	{
		key: "questionnaire_summary",
		label: "Questionnaire Summary",
	},
];

export default class ClientDashboardVisibilityList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.number,
		}),
	};

	state = {
		loading: true,
		dashboardVisibility: {},
	};

	componentDidMount() {
		this.loadData(this.props.params.clientId);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.params.clientId !== this.props.params.clientId) {
			this.loadData(nextProps.params.clientId);
			return;
		}

		if (this.props.children && !nextProps.children) {
			this.loadData(this.props.params.clientId);
		}
	}

	loadData = (clientId) => {
		this.setState({ loading: true });

		fetchClientDashboardVisibility(clientId)
			.done((response) => {
				this.setState({
					loading: false,
					dashboardVisibility: response || {},
				});
			})
			.fail(() => {
				this.setState({
					loading: false,
					dashboardVisibility: {},
				});
			});
	};

	render() {
		if (this.state.loading) {
			return <Loading />;
		}

		const { dashboardVisibility } = this.state;

		return (
			<div className="table-responsive">
				<h3 className="page-header">
					<Link
						to={`/client/${this.props.params.clientId}/client_dashboard_visibility/edit`}
						className="btn btn-default pull-right"
					>
						<Pencil /> Edit
					</Link>
				Dashboard Visibility
				</h3>

				<table className="table table-striped table-bordered">
					<thead>
						<tr>
							<th>Dashboard Item</th>
							<th style={{ width: "140px", textAlign: "center" }}>Visible</th>
						</tr>
					</thead>

					<tbody>
						{DASHBOARD_ITEMS.map((item) => (
							<tr key={item.key}>
								<td>{item.label}</td>

								<td style={{ textAlign: "center" }}>
									{dashboardVisibility[item.key] ? <Check /> : <Cross />}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{this.props.children}
			</div>
		);
	}
}
