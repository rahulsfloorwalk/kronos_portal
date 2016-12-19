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
					<Panel type="primary" title="Vote for FloorWalk">
						<p>FloorWalk has been selected in Zoho's Small Businesses SELL BIG with ZOHO Contest</p>
						<p>Cast your vote for FloorWalk and show your appreciation.</p>
						<p><b>#SmallBizSellBig</b></p>
						<a target="_blank" href="https://www.zoho.com/sellbig/vote/e2b86301a1d2a8bef74faf0c0302816890b61cfc" className="btn btn-primary btn-lg">
							Vote For Us
						</a>
					</Panel>
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
