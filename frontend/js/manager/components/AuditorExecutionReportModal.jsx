// import React from "react";
// import PropTypes from "prop-types";

// import Modal from "../../components/Modal.jsx";
// import Loading from "../../components/Loading.jsx";
// import Jumbotron from "../../components/Jumbotron.jsx";

// import { fetchAuditorExecutionReports } from "../service/auditor_export_summary";
// import { Link } from "react-router";

// export default class AuditorExecutionReportModal extends React.Component {
// 	static propTypes = {
// 		auditCycleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
// 		userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
// 		auditorName: PropTypes.string,
// 		status: PropTypes.oneOf(["pending", "completed"]).isRequired,
// 		onClose: PropTypes.func.isRequired,
// 	};

// 	state = {
// 		loading: true,
// 		data: [],
// 	};

// 	componentDidMount(){
// 		fetchAuditorExecutionReports(this.props.auditCycleId, this.props.userId, this.props.status).then(data => {
// 			this.setState({ data, loading: false });
// 		});
// 	}

// 	handleWithdraw = (row) => {
// 		// TODO: wire to real withdraw API once ready (POST endpoint pending)
// 		console.log("withdraw clicked for store", row.id);
// 	};

// 	renderRows(){
//         return this.state.data.map(row => {
//             const showPercentage = row.status === "ACKNOWLEDGED" || row.status === "ASSIGNED";
//             return (
//                 <tr key={row.audit_store_id}>
//                     <td>{row.auditor_name}</td>
//                     <td>{row.store_name}</td>
//                     <td>{row.status}</td>
//                     <td>{showPercentage ? `${row.audit_store_percentage}%` : "-"}</td>
//                     <td>
//                         {/* <a href="#" className="btn btn-default btn-xs">View</a> */}
//                         <Link to={`/audit_store/${row.audit_store_id}/report`} className="btn btn-default" target="_blank">View</Link>
//                     </td>
//                     <td>
//                         {this.props.status === "pending" &&
//                             <button className="btn btn-danger btn-xs" onClick={() => this.handleWithdraw(row)}>
//                                 Withdraw
//                             </button>
//                         }
//                     </td>
//                 </tr>
//             );
//         });
//     }

// 	render(){
// 		const title = `${this.props.auditorName || "Auditor"} - ${this.props.status === "pending" ? "Pending" : "Completed"} Reports`;

// 		return (
// 			<Modal modalTitle={title} size="modal-lg" onClose={this.props.onClose}>
// 				{this.state.loading ? <Loading/> :
// 					this.state.data.length === 0 ?
// 						<Jumbotron heading="no reports found" para="no reports for this filter"/> :
// 						<table className="table table-bordered table-striped">
// 							<thead>
// 								<tr>
// 									<th>Auditor Name</th>
// 									<th>Store Name</th>
// 									<th>Status</th>
// 									<th>Report completion %</th>
// 									<th>View</th>
// 									<th>Withdraw</th>
// 								</tr>
// 							</thead>
// 							<tbody>
// 								{this.renderRows()}
// 							</tbody>
// 						</table>
// 				}
// 			</Modal>
// 		);
// 	}
// }


// ---------------------

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import { fetchAuditorExecutionReports } from "../service/auditor_export_summary";
import { withdrawAuditStore } from "../actions/audit_store";
import { Link } from "react-router";

export class AuditorExecutionReportModal extends React.Component {
	static propTypes = {
		auditCycleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		auditorName: PropTypes.string,
		status: PropTypes.oneOf(["pending", "completed"]).isRequired,
		onClose: PropTypes.func.isRequired,
		withdrawAuditStore: PropTypes.func.isRequired,
	};

	state = {
		loading: true,
		data: [],
		withdrawingId: null,
		confirmingRow: null,
		errorMessage: null,
	};

	componentDidMount(){
		fetchAuditorExecutionReports(this.props.auditCycleId, this.props.userId, this.props.status).then(data => {
			this.setState({ data, loading: false });
		});
	}

	openConfirm = (row) => {
		this.setState({ confirmingRow: row });
	};

	closeConfirm = () => {
		this.setState({ confirmingRow: null });
	};

	closeError = () => {
		this.setState({ errorMessage: null });
	};

	handleWithdrawConfirmed = () => {
		const row = this.state.confirmingRow;
		this.setState({ confirmingRow: null, withdrawingId: row.audit_store_id });

		this.props.withdrawAuditStore(row.audit_store_id, "").then(() => {
			this.setState(prevState => ({
				data: prevState.data.filter(r => r.audit_store_id !== row.audit_store_id),
				withdrawingId: null,
			}));
		}).fail(() => {
			this.setState({
				withdrawingId: null,
				errorMessage: "Failed to withdraw. Please try again.",
			});
		});
	};

	renderPercentage(row, showPercentage){
		if(!showPercentage || row.audit_store_percentage === null) {
			return "-";
		}
		return `${row.audit_store_percentage}%`;
	}
	renderRows(){
		return this.state.data.map(row => {
			const showPercentage = row.status === "ACKNOWLEDGED" || row.status === "ASSIGNED" || row.status === "SUBMITTED";
			const isWithdrawing = this.state.withdrawingId === row.audit_store_id;
			return (
				<tr key={row.audit_store_id}>
					<td>{row.auditor_name}</td>
					<td>{row.store_name}</td>
					<td>{row.status}</td>
					{/* <td>{showPercentage ? `${row.audit_store_percentage}%` : "-"}</td> */}
					<td>{this.renderPercentage(row, showPercentage)}</td>
					<td>
						<Link to={`/audit_store/${row.audit_store_id}/report`} className="btn btn-default" target="_blank">View</Link>
					</td>
					<td>
						{this.props.status === "pending" &&
							<button
								className="btn btn-danger btn-default"
								onClick={() => this.openConfirm(row)}
								disabled={isWithdrawing}
							>
								{isWithdrawing ? "Withdrawing..." : "Withdraw"}
							</button>
						}
					</td>
				</tr>
			);
		});
	}

	render(){
		const title = `${this.props.auditorName || "Auditor"} - ${this.props.status === "pending" ? "Pending" : "Completed"} Reports`;

		return (
			<React.Fragment>
				<Modal modalTitle={title} size="modal-lg" onClose={this.props.onClose}>
					{this.state.loading ? <Loading/> :
						this.state.data.length === 0 ?
							<Jumbotron heading="no reports found" para="no reports for this filter"/> :
							<table className="table table-bordered table-striped">
								<thead>
									<tr>
										<th>Auditor Name</th>
										<th>Store Name</th>
										<th>Status</th>
										<th>Report completion %</th>
										<th>View</th>
										<th>Withdraw</th>
									</tr>
								</thead>
								<tbody>
									{this.renderRows()}
								</tbody>
							</table>
					}
				</Modal>

				{this.state.confirmingRow &&
					<ConfirmDialog
						title="Withdraw report?"
						message={`Are you sure you want to withdraw the report for "${this.state.confirmingRow.store_name}"?`}
						confirmText="Withdraw"
						cancelText="Cancel"
						onConfirm={this.handleWithdrawConfirmed}
						onCancel={this.closeConfirm}
					/>
				}

				{this.state.errorMessage &&
					<ConfirmDialog
						title="Error"
						message={this.state.errorMessage}
						confirmText="OK"
						cancelText="OK"
						onConfirm={this.closeError}
						onCancel={this.closeError}
					/>
				}
			</React.Fragment>
		);
	}
}

export default connect(null, { withdrawAuditStore })(AuditorExecutionReportModal);