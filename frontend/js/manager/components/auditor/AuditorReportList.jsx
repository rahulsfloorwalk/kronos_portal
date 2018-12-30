import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { getAuditorReports } from "../../service/auditor_stats.js";

import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import Loading from "../../../components/Loading.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";

export default class AuditorReportList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.string.isRequired,
		}),
	};
	state = {};

	componentDidMount() {
		getAuditorReports(this.props.params.auditorId).then((stats)=> this.setState({
			stats
		}));
	}

	render() {
		if(! this.state.stats){
			return <Loading/>;
		}
		let audit_store_arr = this.state.stats.map((row) => {
			let linkTo = `audit_store/${row.id}/report`;
			return (
				<tr key={row.id} onClick={() => hashHistory.push(linkTo)} style={{cursor:"pointer"}}>
					<td>{row.audit__audit_cycle__client__name}</td>
					<td>{row.audit__store__name}</td>
					<td>{row.audit__audit_cycle__name}</td>
					<td>{row.audit_date}</td>
					<td><AuditStoreRating rating={row.qa_rating}/></td>
					<td><AuditStoreStatusLabel status={row.status} /></td>
				</tr>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Audit Report Summary</h4>
				</div>
				<table className="table table-striped table-hover">
					<tbody>
						<tr>
							<th>Client</th>
							<th>Store</th>
							<th>Audit Cycle</th>
							<th>Audit Date</th>
							<th>QA Rating</th>
							<th>Status</th>
						</tr>
						{audit_store_arr}
					</tbody>
				</table>
			</div>
		);
	}
}
