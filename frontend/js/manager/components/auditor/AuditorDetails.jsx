import React, { Component } from "react";
import PropTypes from "prop-types";

import ProfileInfoPanel from "./ProfileInfoPanel.jsx";
import BankInfoPanel from "./BankInfoPanel.jsx";
import AdditionalInfoPanel from "./AdditionalInfoPanel.jsx";
import SocialInfoPanel from "./SocialInfoPanel.jsx";
import AuditorPreferencesPanel from "./AuditorPreferencesPanel.jsx";

export default class AuditorDetails extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.string.isRequired,
		}),
		children: PropTypes.node,
	};
	constructor(props){
		super(props);
	}
	render(){
		return (
			<div className="row">
				<div className="col-md-4">
					<ProfileInfoPanel auditorId={parseInt(this.props.params.auditorId)}/>
				</div>
				<div className="col-md-4">
					<BankInfoPanel auditorId={this.props.params.auditorId}/>
					<SocialInfoPanel auditorId={this.props.params.auditorId}/>
					<AuditorPreferencesPanel auditorId={this.props.params.auditorId}/>
				</div>
				<div className="col-md-4">
					<AdditionalInfoPanel auditorId={this.props.params.auditorId}/>
				</div>
				{this.props.children}
			</div>
		);
	}
}
