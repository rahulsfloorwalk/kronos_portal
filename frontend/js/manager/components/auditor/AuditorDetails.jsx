import React, { Component } from 'react';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';
import SocialInfoPanel from './SocialInfoPanel.jsx';
import AuditorPreferencesPanel from './AuditorPreferencesPanel.jsx';

export default class AuditorDetails extends Component{
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
