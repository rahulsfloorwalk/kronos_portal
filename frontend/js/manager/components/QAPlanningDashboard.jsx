import React, { Component } from "react";
import "../../../css/bs_overrides.scss";
import { getDashboardPMDetails } from "../service/dashboard_audit_cycles";

export default class QAPlanningDashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			summary: null,
			clients: [],
			qas: []
		};
	}

	componentDidMount() {
		getDashboardPMDetails("moderator").then((data) =>
			this.setState({
				summary: data.summary,
				clients: data.clients,
				qas: data.moderators
			})
		);
	}

	render() {
		const { summary, clients, qas } = this.state;

		return (
			<div
				className="table-responsive"
				style={{
					marginTop: "7rem",
					maxHeight: "600px",
					overflow: "auto"
				}}
			>
				{/* <h4>QA Planning</h4> */}

				<table className="table table-bordered table-condensed pm-planning-table">
					<thead style={{ position: "sticky", top: -1, zIndex: 100, backgroundColor: "#fff", boxShadow: "0 1px 0 #ddd" }}>
						<tr><th  colSpan={clients.length + 4}
							className="text-left"
							style={{
								backgroundColor: "#fff",
								fontWeight: "bold",
								fontSize: "18px",
								padding:"2rem 1rem",
							}}>QA Planning</th>
						</tr>
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
						{qas.map((qa, index) => {
							const allocationMap = qa.clients.reduce((acc, c) => {
								acc[c.client_id] = c.remaining_count;
								return acc;
							}, {});

							return (
								<tr key={qa.moderator_id}>
									<td className="text-center">
										{index + 1}
									</td>
									<td className="sticky-column">
										{qa.moderator_name}
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
										{qa.remaining_count || ""}
									</td>

									<td className="text-center" style={{ backgroundColor: "#efebeb" }}>
										{qa.percentage || ""}
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