import React from "react";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import { fetchAuditorExecutionReport } from "../service/auditor_export_summary";
import AuditorExecutionReportModal from "./AuditorExecutionReportModal.jsx";

const PAGE_SIZE = 15;

const COLUMNS = [
	{ key: "auditor_name", label: "Auditor Name" },
	{ key: "auditor_mobile_number", label: "Mobile Number" },
	{ key: "cities", label: "Cities" },
	{ key: "audit_dates", label: "Audit Dates" },
	{ key: "report_status", label: "Report Status" },
	{ key: "grand_total", label: "Grand Total", numeric: true },
	{ key: "pending_execution", label: "Pending Execution", numeric: true },
	{ key: "done_audits", label: "Done Audits", numeric: true },
	{ key: "failed_reports", label: "Failed Reports", numeric: true },
	{ key: "comment", label: "Comment" },
];

export class AuditCycleAuditorExecutionSummary extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		loading: true,
		data: [],
		visibleCount: PAGE_SIZE,
		sortKey: null,
		sortDirection: "asc",
		activeModal: null,
	};

	componentDidMount(){
		fetchAuditorExecutionReport(this.props.params.auditCycleId).then(data => {
			this.setState({ data, loading: false });
		});
	}

	handleSort = (key) => {
		this.setState(prevState => {
			const sortDirection = prevState.sortKey === key && prevState.sortDirection === "asc" ? "desc" : "asc";
			return { sortKey: key, sortDirection };
		});
	};

	getSortedData(){
		const { data, sortKey, sortDirection } = this.state;
		if(!sortKey) {
			return data;
		}

		const column = COLUMNS.find(c => c.key === sortKey);
		const sorted = [...data].sort((a, b) => {
			let result;
			if(column.numeric) {
				result = a[sortKey] - b[sortKey];
			} else {
				result = String(a[sortKey]).localeCompare(String(b[sortKey]));
			}
			return sortDirection === "asc" ? result : -result;
		});
		return sorted;
	}

	handleLoadMore = () => {
		this.setState(prevState => ({ visibleCount: prevState.visibleCount + PAGE_SIZE }));
	};

		openModal = (row, status) => {
			this.setState({ activeModal: { userId: row.id, auditorName: row.auditor_name, status } });
		};

		closeModal = () => {
			this.setState({ activeModal: null });
		};
		render(){
			if(this.state.loading) {
				return <Loading/>;
			}

			const sortedData = this.getSortedData();

			if(sortedData.length === 0) {
				return (<div>
					&nbsp;
					<Jumbotron key="empty" heading="no auditors found" para="no auditor execution data available for this audit cycle"/>
				</div>);
			}

			const visibleData = sortedData.slice(0, this.state.visibleCount);
			const rightAlign = { textAlign: "right" };

			const headings = COLUMNS.map(col => {
				const isSorted = this.state.sortKey === col.key;
				const arrow = isSorted ? (this.state.sortDirection === "asc" ? " \u25B2" : " \u25BC") : "";
				return (
					<th
						key={col.key}
						style={col.numeric ? rightAlign : null}
						onClick={() => this.handleSort(col.key)}
						role="button"
					>
						{col.label}{arrow}
					</th>
				);
			});

			const rows = visibleData.map(row => (
				<tr key={row.id}>
					{COLUMNS.map(col => {
						if(col.key === "pending_execution" || col.key === "done_audits") {
							const status = col.key === "pending_execution" ? "pending" : "completed";
							return (
								<td key={col.key} style={rightAlign}>
									<a href="#" style={{ textDecoration: "underline" }} onClick={(e) => { e.preventDefault(); this.openModal(row, status); }}>
										{row[col.key]}
									</a>
								</td>
							);
						}
						return (
							<td key={col.key} style={col.numeric ? rightAlign : null}>
								{row[col.key]}
							</td>
						);
					})}
				</tr>
			));

			return (<div className="table-responsive">
				&nbsp;
				<table className="table table-bordered table-striped">
					<thead>
						<tr>
							{headings}
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{this.state.visibleCount < sortedData.length &&
					<div style={{ textAlign: "center" }}>
						<button className="btn btn-default" onClick={this.handleLoadMore} style={{ marginTop: "10px" }}>
							Load more
						</button>
					</div>
				}
				{this.state.activeModal &&
					<AuditorExecutionReportModal
						auditCycleId={this.props.params.auditCycleId}
						userId={this.state.activeModal.userId}
						auditorName={this.state.activeModal.auditorName}
						status={this.state.activeModal.status}
						onClose={this.closeModal}
					/>
				}
			</div>);
		}
}

export default AuditCycleAuditorExecutionSummary;