import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';

var DetailsPage = React.createClass({
	render: function(){
		return (
			<div className="row">
				<div className="col-md-6">
					<ProfileInfoPanel/>
				</div>
				<div className="col-md-6">
					<BankInfoPanel/>
				</div>
				<div className="col-md-6">
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
