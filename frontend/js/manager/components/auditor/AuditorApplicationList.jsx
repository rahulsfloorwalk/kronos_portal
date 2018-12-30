import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { getAuditorApplications } from "../../service/auditor_stats.js";

import ApplicationStatusLabel from "../../../components/ApplicationStatusLabel.jsx";
import Loading from "../../../components/Loading.jsx";

class AuditorApplicationStats extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.string.isRequired,
		}),
		children: PropTypes.node,
	};
	state = {};

	componentDidMount() {
		getAuditorApplications(this.props.params.auditorId).then((stats)=> this.setState({
			stats
		}));
	}

	render() {
		if(! this.state.stats){
			return <Loading/>;
		}
		let appl_arr = this.state.stats.map((row) => {
			let linkTo = `audit_cycle/${row.audit__audit_cycle__id}/audit`;
			return (
				<tr key={row.id} onClick={() => hashHistory.push(linkTo)} style={{cursor:"pointer"}}>
					<td>{row.audit__audit_cycle__client__name}</td>
					<td>{row.audit__store__name}</td>
					<td>{row.audit__audit_cycle__name}</td>
					<td>{row.audit_date}</td>
					<td><ApplicationStatusLabel status={row.status} /></td>
				</tr>
			);
		});

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Application Summary</h4>
				</div>
				<table className="table table-striped table-hover">
					<tbody>
						<tr>
							<th>Client</th>
							<th>Store</th>
							<th>Audit Cycle</th>
							<th>Audit Date</th>
							<th>Status</th>
						</tr>
						{appl_arr}
					</tbody>
				</table>
			</div>
		);
	}
}

export default AuditorApplicationStats;
