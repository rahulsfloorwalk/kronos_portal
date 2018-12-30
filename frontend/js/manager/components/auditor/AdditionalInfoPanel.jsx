import React from "react";
import PropTypes from "prop-types";

import { getCameraResolution, getOccupation } from "../../../utils.js";
import { fetchAdditionalInfoForAuditor } from "../../service/auditor.js";
import { Check, Cross } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

export default class AdditionalInfoPanel extends React.Component {
	static propTypes = {
		auditorId: PropTypes.number.isRequired,
		children: PropTypes.node,
	};

	state = {};

	componentDidMount() {
		fetchAdditionalInfoForAuditor(this.props.auditorId).done((additionalInfo)=>this.setState({additionalInfo}));
	}

	render() {
		if(! this.state.additionalInfo){
			return <Loading/>;
		}
		var is_complete = this.state.additionalInfo.is_complete ? "panel-success" : "panel-default";
		var has_car = this.state.additionalInfo.has_car ? <Check/> : <Cross/>;
		var laptop_owned = this.state.additionalInfo.laptop_owned ? <Check/> : <Cross/>;

		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<p>Referral Code: { this.state.additionalInfo.referral_code }</p>
					<p>Referred By: { this.state.additionalInfo.referred_by }</p>
					<p>Occupation: { getOccupation(this.state.additionalInfo.occupation) }</p>
					<p>Preferred Distance (km): { this.state.additionalInfo.distance }</p>
					<p>Industry: { this.state.additionalInfo.industry }</p>
					<p>Company: { this.state.additionalInfo.company }</p>
					<p>Car Owned: { has_car }</p>
					<p>Car Model: { this.state.additionalInfo.car_model }</p>
					<p>Car Cost: { this.state.additionalInfo.car_cost }</p>
					<p>Laptop Owned: { laptop_owned }</p>
					<p>Laptop Model: { this.state.additionalInfo.laptop_model }</p>
					<p>Mobile Model: { this.state.additionalInfo.mobile_model }</p>
					<p>Camera Resolution: { getCameraResolution(this.state.additionalInfo.camera_resoulution) }</p>
				</div>
			</div>
		);
	}
}
