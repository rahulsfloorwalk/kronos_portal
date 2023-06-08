import React from "react";
import PropTypes from "prop-types";
import { fetchApplicationStats } from "../../service/audit_cycle_stats.js";

import ApplicationStatusLabel from "../../../components/ApplicationStatusLabel.jsx";
import Loading from "../../../components/Loading.jsx";

export default class ApplicationStatusSummary extends React.Component {
	static propTypes = {
		auditCycleId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	};
	state = {};

	componentDidMount() {
		this._promise = fetchApplicationStats(this.props.auditCycleId).done((stats) => this.setState({ stats }));
	}

	componentWillUnmount() {
		this._promise && this._promise.readyState !== 4 && this._promise.abort();
	}

	render() {
		if(! this.state.stats){
			return <Loading/>;
		}
		return (
			<div className="table-responsive">
				<table className="table table-bordered">
					<thead>
						<tr>
							{
								["APPLIED", "WAITLISTED", "APPROVED", "WITHDRAWN", "REJECTED"].map((status) => {
									return (
										<td key={status} className="text-center">
											<ApplicationStatusLabel status={status} />
										</td>
									);
								})
							}
						</tr>
					</thead>
					<tbody>
						<tr>
							{
								["APPLIED", "WAITLISTED", "APPROVED", "WITHDRAWN", "REJECTED"].map((status) => {
									let item = this.state.stats.find( s => s.status === status);
									return (
										<td key={status} className="text-center">
											<b>{item ? item.count : null}</b>
										</td>
									);
								})
							}
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
