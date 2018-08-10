import React from "react";

import moment from "moment";
import {momentDateFormat} from "../../../../config.js";

import {fetchProfileInfoForAuditor} from "../../service/auditor.js";
import {getGender, getEducationStatus, getMaritalStatus} from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";
import PropTypes from "prop-types";

export default class ProfileInfoPanel extends React.Component {
	static propTypes = {
		auditorId: PropTypes.number.isRequired,
	};

	state = {};

	componentDidMount() {
		fetchProfileInfoForAuditor(this.props.auditorId).then((profileInfo) => this.setState({profileInfo}));
	}

	render() {
		if (!this.state.profileInfo) {
			return <Loading/>;
		}
		var auditor_city = this.state.profileInfo.city || {};
		var is_complete = this.state.profileInfo.is_complete ? "panel-success" : "panel-default";
		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Profile Info</h3>
				</div>
				<div className="panel-body">
					<p>First Name: {this.state.profileInfo.first_name}</p>
					<p>Last Name: {this.state.profileInfo.last_name}</p>
					<p>Gender: {getGender(this.state.profileInfo.gender)}</p>
					<p>Education: {getEducationStatus(this.state.profileInfo.education)}</p>
					<p>Date of Birth: {moment(this.state.profileInfo.date_of_birth).format(momentDateFormat)}</p>
					<p>Marital Status: {getMaritalStatus(this.state.profileInfo.marital_status)}</p>
					<p>Address: {this.state.profileInfo.address}</p>
					<p>City: {auditor_city.name}</p>
					<p>State: {auditor_city.state}</p>
					<p>Pincode: {this.state.profileInfo.pincode}</p>
					<p>Rating: {this.state.profileInfo.average_rating !== null ?
						<AuditStoreRating rating={Math.round(this.state.profileInfo.average_rating)}/> : null}</p>
				</div>
			</div>
		);
	}
}
