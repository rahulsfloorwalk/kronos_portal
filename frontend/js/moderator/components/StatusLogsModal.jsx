import React from "react";
import PropTypes from "prop-types";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

import moment from "moment";
import { getAuditStoreStatus } from "../../utils.js";
import { fetchStatusLogs } from "../service/audit_store.js";

export default class StatusLogsModal extends React.Component {
	static propTypes = {
		isOpen: PropTypes.bool.isRequired,
		auditStoreId: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		onClose: PropTypes.func.isRequired,
	};

	state = {
		loading: false,
		statusLogs: [],
	};

	componentDidMount() {
		this.loadStatusLogs();
	}
	componentDidUpdate(prevProps) {
		// Fetch only when modal is opened
		if (!prevProps.isOpen && this.props.isOpen) {
			this.loadStatusLogs();
		}
	}

	loadStatusLogs = () => {
		this.setState({ loading: true });

		fetchStatusLogs(this.props.auditStoreId)
			.then((statusLogs) => {
				this.setState({ statusLogs });
			})
			.always(() => {
				this.setState({ loading: false });
			});
	};

	render() {
		if (!this.props.isOpen) return null;

		return (
			<Modal
				modalTitle="Status Logs"
				size="modal-lg"
				onClose={this.props.onClose}
			>
				{this.state.loading ? (
					<Loading />
				) : (
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Status</th>
								<th>User</th>
								<th>Message</th>
								<th>Created At</th>
							</tr>
						</thead>
						<tbody>
							{this.state.statusLogs.length > 0 ? (
								this.state.statusLogs.map((log) => (
									<tr key={log.id}>
										<td>{log.status ? getAuditStoreStatus(log.status) : "---"}</td>
										<td>{log.user_actor.email || "---"}</td>
										<td>{log.message || "---"}</td>
										<td>
											{moment(log.created_at).format("DD MMM YYYY, hh:mm A")}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="4" className="text-center">
										No status logs found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</Modal>
		);
	}
}