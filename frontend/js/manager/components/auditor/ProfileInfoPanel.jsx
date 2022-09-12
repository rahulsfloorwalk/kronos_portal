import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import {momentDateFormat} from "../../../../config.js";

import {fetchProfileInfoForAuditor, fetchRatingForAuditor} from "../../service/auditor.js";
import {getGender, getEducationStatus, getMaritalStatus} from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";
import StarRating from "../../../components/StarRating.jsx";

export default class ProfileInfoPanel extends React.Component {
	static propTypes = {
		auditorId: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		]).isRequired,
	};

	state = {
		rating: [],
	};

	componentDidMount() {
		fetchProfileInfoForAuditor(this.props.auditorId).then((profileInfo) => this.setState({profileInfo}));
		fetchRatingForAuditor(this.props.auditorId).then((rating) => this.setState({"rating": rating.auditor_rating}));
	}
	componentWillReceiveProps(nextProps) {
		fetchProfileInfoForAuditor(nextProps.auditorId).then((profileInfo) => this.setState({profileInfo}));
		fetchRatingForAuditor(nextProps.auditorId).then((rating) => this.setState({"rating": rating.auditor_rating}));
	}

	render() {
		let rating_rows = [];
		if (!this.state.profileInfo) {
			return <Loading/>;
		}
		for(let i of this.state.rating){
			rating_rows.push(<li key={i.rating}><b>{i.rating}&nbsp;Star&nbsp;&nbsp;&nbsp;&nbsp;<StarRating rating={i.rating}/>&nbsp;&nbsp;{i.avg}%</b></li>);
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
					<p>Report Rating: {this.state.profileInfo.average_rating !== null ?
						<AuditStoreRating rating={Math.round(this.state.profileInfo.average_rating)}/> : null}</p>
					<p>Auditor Rating: (<Link to={`/auditor/${this.props.auditorId}/details/auditor_rating/edit`}>change</Link>)<br/><br/>
						<ul style={{listStyleType: "none", padding: "inherit"}}>
							<li><label><b>Overall</b></label>&nbsp;&nbsp;<StarRating rating={this.state.profileInfo.avg_auditor_rating} /></li>
							{rating_rows}
						</ul>
					</p>
				</div>
			</div>
		);
	}
}
