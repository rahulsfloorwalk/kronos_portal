import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Link, withRouter } from "react-router";

import { findAgencyUserByPresenceInCityId } from "../../service/agency_user.js";

import { Rook, Earphone, Envelope, HandRight } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

class AgencyListForAudit extends Component{
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
		agencyUsers: [],
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	};

	reloadAgencyUserList = (cityId) => {
		this.setLoading(true);
		findAgencyUserByPresenceInCityId(cityId).then((agencyUsers) => {
			this.setState({agencyUsers});
		}).always(()=>this.setLoading(false));
	};
	componentDidMount(){
		this.reloadAgencyUserList(this.props.audit.store.city.id);
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		const rows = this.state.agencyUsers.map((au) => <tr key={au.id}>
			<td>
				<Rook/> <Link to={`/agency_user/${au.user_id}`}>{au.agency.name}</Link>
			</td>
			<td>{au.full_name}</td>
			<td><Earphone/> {au.user.mobile_numbers[0] && au.user.mobile_numbers[0].mobile_number}</td>
			<td><Envelope/> {au.user.email}</td>
			<td>
				<Link to={`/audit_cycle/${this.props.params.auditCycleId}/audit/${this.props.auditId}/application/fiat?email=${au.user.email}`} title="Fiat Assign" className="btn btn-default">
					<HandRight/> Assign
				</Link>
			</td>
		</tr>);

		if(rows.length === 0){
			rows.push(<tr key="empty"><td colSpan={5} className="text-center text-muted">no agencies found in this city</td></tr>);
		}
		return (
			<table className="table">
				<thead>
					<tr>
						<th>Agency Name</th>
						<th>Contact Name</th>
						<th>Phone Number</th>
						<th>Email</th>
						<th>Assign</th>
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

export default connect(mapStoreToProps)(withRouter(AgencyListForAudit));
