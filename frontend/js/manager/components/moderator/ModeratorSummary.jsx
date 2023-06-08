import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import Jumbotron from "../../../components/Jumbotron.jsx";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import { AuditStoreStatus } from "../../../constants";

import { fetchModeratorSummary, fetchModerators } from "../../actions/moderator";
import { findModerators } from "../../selectors/moderator";
import { findModeratorSummary } from "../../selectors/moderator_summary";

export class ModeratorSummary extends React.Component{
	static propTypes = {
		summary: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number.isRequired).isRequired),
		moderators: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			email: PropTypes.string.isRequired,
		}).isRequired),
		children: PropTypes.node,
		fetchModeratorSummary: PropTypes.func.isRequired,
		fetchModerators: PropTypes.func.isRequired,
	};

	componentDidMount(){
		this.props.fetchModeratorSummary();
		this.props.fetchModerators();
	}

	render(){
		const statuses = AuditStoreStatus.filter(s => !["REJECTED", "ACCEPTED", "WITHDRAWN", "AUDITOR_WITHDRAWN", "FAILED"].includes(s));

		if(!this.props.summary) {
			return <Loading/>;
		}

		const rightAlign = {
			textAlign: "right",
		};

		const rows = [];
		for(const moderatorId in this.props.summary){
			const moderator = this.props.moderators.find(m => m.id === parseInt(moderatorId));
			const cells = statuses.map(s => <td key={s} style={rightAlign}>{this.props.summary[moderatorId][s]}</td>);
			rows.push(<tr key={moderatorId}>
				<td><Link to={`/moderator/summary/${moderatorId}/reportlist`}>{moderator ? moderator.email : ""}</Link></td>
				{cells}
			</tr>);
		}

		if(rows.length === 0) {
			return (<div>
				&nbsp;
				<Jumbotron key="empty" heading="no reports assigned" para="assign a report to a moderator to make it visible here"/>
			</div>);
		}


		const headings = statuses.map(s => <th style={rightAlign} key={s}><AuditStoreStatusLabel status={s}/></th>);
		return (<div className="table-responsive">
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
			{this.props.children}
		</div>);
	}
}

const mapStoreToProps = (store) => {
	return {
		summary: findModeratorSummary(store),
		moderators: findModerators(store),
	};
};

export default connect(mapStoreToProps, {
	fetchModeratorSummary,
	fetchModerators,
})(ModeratorSummary);
