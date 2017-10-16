import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { getHairColor, getCameraResolution, getOccupation } from '../../../utils.js'
import { fetchAuditorPreferences } from '../../../manager/service/preferences.js'
import { Check, Cross } from '../../Icons.jsx';
import Loading from '../../Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			preferences: null,
		};
	},
	componentDidMount: function() {
		fetchAuditorPreferences(this.props.auditorId).done(preferences => {
			this.setState({ preferences });
		});
	},
	render: function(){
		if(! this.state.preferences){
			return <Loading/>;
		}
		let receive_new_opportunities_email = this.state.preferences.receive_new_opportunities_email ? <Check/> : <Cross/>;
		let receive_transactional_email = this.state.preferences.receive_transactional_email ? <Check/> : <Cross/>;

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Preferences</h3>
				</div>
				<div className="panel-body">
					<p>Receive New Opportunities Email: { receive_new_opportunities_email }</p>
					<p>Receive Transactional Email: { receive_transactional_email }</p>
				</div>
			</div>
		);
	},
});

