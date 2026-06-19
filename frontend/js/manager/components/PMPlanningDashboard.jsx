import React, { Component } from "react";
import "../../../css/bs_overrides.scss";
import { getDashboardPMDetails } from "../service/dashboard_audit_cycles";

export default class PMPlanningDashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			summary: null,
			clients: [],
			managers: []
		};
	}

	componentDidMount() {
		getDashboardPMDetails("manager").then((data) =>
			this.setState({
				summary: data.summary,
				clients: data.clients,
				managers: data.managers,
			})
		);
	}

	render() {
		const { summary, clients, managers } = this.state;

		return (
			<div
				className="table-responsive"
				style={{
					marginTop: "20px",
					maxHeight: "400px",
					overflow: "auto"
				}}
			>
				<h4>PM Planning</h4>

				<table className="table table-bordered table-condensed pm-planning-table">
					<thead style={{ position: "sticky", top: -1, zIndex: 100, backgroundColor: "#fff", boxShadow: "0 1px 0 #ddd" }}>
						<tr>
							<th rowSpan="2" style={{ width: "60px", backgroundColor: "#efebeb" }}></th>
							<th rowSpan="2" style={{ minWidth: "220px", backgroundColor: "#efebeb" }} />

							{clients.map(client => (
								<th
									key={client.client_id}
									rowSpan="2"
									className="text-center"
									style={{ backgroundColor: "#efebeb" }}
								>
									{client.client_name}
								</th>
							))}

							<th rowSpan="2" className="text-center" style={{ backgroundColor: "#efebeb" }}>
								Total Remaining Reports
							</th>

							<th rowSpan="2" className="text-center" style={{ backgroundColor: "#efebeb" }}>
								% of Reports
							</th>
						</tr>
						<tr />
						<tr>
							<th style={{ backgroundColor: "#efebeb" }} />
							<th style={{ backgroundColor: "#efebeb" }}>
								<strong>Total Count</strong>
							</th>

							{clients.map(client => (
								<th key={client.client_id} className="text-center" style={{ backgroundColor: "#efebeb" }}>
									<strong>{client.total_count}</strong>
								</th>
							))}

							<th className="text-center" style={{ backgroundColor: "#efebeb" }}>
								<strong>{summary && summary.total_count !== undefined ? summary.total_count : ""}</strong>
							</th>

							<th style={{ backgroundColor: "#efebeb" }} />
						</tr>

						<tr>
							<th style={{ backgroundColor: "#efebeb" }} />
							<th style={{ backgroundColor: "#efebeb" }}>
								<strong>Audits done (CR+PM)</strong>
							</th>

							{clients.map(client => (
								<th key={client.client_id} className="text-center" style={{ backgroundColor: "#efebeb" }}>
									{client.completed_count}
								</th>
							))}

							<th className="text-center" style={{ backgroundColor: "#efebeb" }}>
								<strong>{summary && summary.completed_count !== undefined ? summary.completed_count : ""}</strong>
							</th>

							<th style={{ backgroundColor: "#efebeb" }} />
						</tr>

						<tr style={{ backgroundColor: "#eaf7e7" }}>
							<th style={{ backgroundColor: "#efebeb" }} />
							<th style={{ backgroundColor: "#efebeb" }}>
								<strong>Remaining Count</strong>
							</th>

							{clients.map(client => (
								<th key={client.client_id} className="text-center" >
									<strong>{client.remaining_count}</strong>
								</th>
							))}

							<th className="text-center" style={{ backgroundColor: "#efebeb" }}>
								<strong>{summary && summary.remaining_count !== undefined ? summary.remaining_count : ""}</strong>
							</th>

							<th style={{ backgroundColor: "#efebeb" }} />
						</tr>
					</thead>

					<tbody>
						{managers.map((manager, index) => {
							// Build a lookup map: client_id -> remaining_count
							const allocationMap = manager.clients.reduce((acc, c) => {
								acc[c.client_id] = c.remaining_count;
								return acc;
							}, {});

							return (
								<tr key={manager.manager_id}>
									<td className="text-center">
										{index + 1}
									</td>
									<td className="sticky-column">
										{manager.manager_name}
									</td>

									{clients.map(client => (
										<td
											key={client.client_id}
											className="text-center"
										>
											{allocationMap[client.client_id] !== undefined ? allocationMap[client.client_id] : ""}
										</td>
									))}

									<td className="text-center" style={{ backgroundColor: "#efebeb" }}>
										{manager.total_workload || ""}
									</td>

									<td className="text-center" style={{ backgroundColor: "#efebeb" }}>
										{manager.percentage || ""}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}