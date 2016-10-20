import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditor } from '../../actions.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';

var AuditorDetailsPage = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAuditor(this.props.params.auditorId));
	},
	render: function(){
		if(! this.props.auditor){
			return <Loading/>;
		}
		return (
			<div>
				<Panel title="Email">
					<p>Email Address: { this.props.auditor.email }</p>
				</Panel>
				<ProfileInfoPanel auditorId={this.props.params.auditorId}/>
				<BankInfoPanel auditorId={this.props.params.auditorId}/>
				<AdditionalInfoPanel auditorId={this.props.params.auditorId}/>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditor: store.auditors[ownProps.params.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorDetailsPage);
