import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import ProfileInfoPanel from '../ProfileInfoPanel.jsx';
import BankInfoPanel from '../BankInfoPanel.jsx';
import AdditionalInfoPanel from '../AdditionalInfoPanel.jsx';

var DetailsPage = React.createClass({
	render: function(){
		return (
			<div>
				<ProfileInfoPanel/>
				<BankInfoPanel/>
				<AdditionalInfoPanel/>
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
