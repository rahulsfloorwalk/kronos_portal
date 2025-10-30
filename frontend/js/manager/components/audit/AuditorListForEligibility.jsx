import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { withRouter,Link } from "react-router";

import { findEligibileAuditorByPresenceInCityId } from "../../service/agency_user.js";

import { Earphone, Envelope } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

class AuditorListForEligibility extends Component {
	static propTypes = {
		auditId: PropTypes.number.isRequired,
		auditCycleId: PropTypes.number,

		audit: PropTypes.shape({
			id: PropTypes.number.isRequired,
			store: PropTypes.shape({
				id: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
				city: PropTypes.shape({
					id: PropTypes.number.isRequired,
					name: PropTypes.string.isRequired,
				}).isRequired,
			}).isRequired,
		}),

		location: PropTypes.shape({
			state: PropTypes.object,
		}).isRequired,

		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,

		router: PropTypes.object,
	};

	state = {
		loading: true,
		eligibleAuditors: [],
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	};

	reloadAgencyUserList = (auditCycleId, storeId) => {
		this.setLoading(true);
		findEligibileAuditorByPresenceInCityId(auditCycleId, storeId).then((auditors) => {
			this.setState({ eligibleAuditors: auditors.eligible_auditors });
		}).always(() => this.setLoading(false));
	};
	componentDidMount() {
		this.reloadAgencyUserList(this.props.params.auditCycleId, this.props.audit.store.id);
	}

	formatDate = (dateString) => {
		if (!dateString) return "-";
		const date = new Date(dateString);

		const day = date.getDate();
		const month = date.toLocaleString("en-GB", { month: "short" });
		const year = date.getFullYear();

		const getOrdinalSuffix = (n) => {
			const j = n % 10,
				k = n % 100;
			if (j === 1 && k !== 11) return "st";
			if (j === 2 && k !== 12) return "nd";
			if (j === 3 && k !== 13) return "rd";
			return "th";
		};

		return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
	};
	render() {
		if (this.state.loading) {
			return <Loading />;
		}
		const rows = this.state.eligibleAuditors.map((au) => <tr key={au.id}>
			<td><Link to={`/auditor/${au.user_id}`} target="_blank">{au.first_name} {" "}{au.last_name}</Link></td>
			<td><Earphone />  {au.mobile_number}</td>
			<td><Envelope /> {au.email}</td>
			<td>{au.match_percentage}%</td>
			<td>{au.distance_km} Km</td>
			<td>{au.last_login ? this.formatDate(au.last_login): "---"}</td>
		</tr>);

		if (rows.length === 0) {
			rows.push(<tr key="empty"><td colSpan={5} className="text-center text-muted">No Eligible Auditor is found for this Store</td></tr>);
		}
		return (
			<table className="table">
				<thead>
					<tr>
						<th>Auditor Name</th>
						<th>Phone Number</th>
						<th>Email</th>
						<th>Eligibility Match</th>
						<th>Distance</th>
						<th>Last login</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		audit: store.audits[ownProps.auditId],
	};
};

export default connect(mapStoreToProps)(withRouter(AuditorListForEligibility));