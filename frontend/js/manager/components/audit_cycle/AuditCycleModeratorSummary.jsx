import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Loading from "../../../components/Loading.jsx";
import Jumbotron from "../../../components/Jumbotron.jsx";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import { AuditStoreStatus } from "../../../constants";

import { fetchModeratorSummaryByAuditCycle, fetchModerators } from "../../actions/moderator";
import { findModerators } from "../../selectors/moderator";
import { findModeratorSummaryByAuditCycleId } from "../../selectors/audit_cycle_moderator_summary";

export class AuditCycleModeratorSummary extends React.Component{
	static propTypes = {
		auditCycleId: PropTypes.number.isRequired,
		summary: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number.isRequired).isRequired),
		moderators: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			email: PropTypes.string.isRequired,
		}).isRequired),

		fetchModeratorSummaryByAuditCycle: PropTypes.func.isRequired,
		fetchModerators: PropTypes.func.isRequired,
	};

	componentDidMount(){
		this.props.fetchModeratorSummaryByAuditCycle(this.props.auditCycleId);
		this.props.fetchModerators();
	}

	render(){
		if(!this.props.summary) {
			return <Loading/>;
		}

		const rightAlign = {
			textAlign: "right",
		};

		const rows = [];
		for(const moderatorId in this.props.summary){
			const moderator = this.props.moderators.find(m => m.id === parseInt(moderatorId));
			const cells = AuditStoreStatus.map(s => <td key={s} style={rightAlign}>{this.props.summary[moderatorId][s]}</td>);
			rows.push(<tr key={moderatorId}>
				<td>{moderator ? moderator.email : ""}</td>
				{cells}
			</tr>);
		}

		if(rows.length === 0) {
			return (<div>
				&nbsp;
				<Jumbotron key="empty" heading="no reports assigned" para="assign a report to a moderator to make it visible here"/>
			</div>);
		}


		const headings = AuditStoreStatus.map(s => <th style={rightAlign} key={s}><AuditStoreStatusLabel status={s}/></th>);
		return (<div>
			&nbsp;
			<table className="table table-bordered table-striped">
				<thead>
					<tr>
						<th>Moderator</th>
						{headings}
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const auditCycleId = parseInt(ownProps.params.auditCycleId);
	return {
		auditCycleId,
		summary: findModeratorSummaryByAuditCycleId(store, auditCycleId),
		moderators: findModerators(store),
	};
};

export default connect(mapStoreToProps, {
	fetchModeratorSummaryByAuditCycle,
	fetchModerators,
})(AuditCycleModeratorSummary);
