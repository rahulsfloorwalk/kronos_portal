import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';

import Panel from '../Panel.jsx';

var DetailsPage = React.createClass({
	render: function(){
		return (
			<div className="row">
				<div className="col-md-6">
					<ProfileInfoPanel/>
					<Panel title="Password" body={true}>
						<p><a href="/auth/password_change">Click here</a> to change your password.</p>
					</Panel>
				</div>
				<div className="col-md-6">
					<BankInfoPanel/>
					<AdditionalInfoPanel/>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
	};
};

export default ReactRedux.connect(mapStoreToProps)(DetailsPage);
