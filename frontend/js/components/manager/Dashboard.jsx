import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';

import NotificationBox from './NotificationBox.jsx';
import AuditCycleDashboard from './AuditCycleDashboard.jsx';

var Dashboard = React.createClass({
	render: function(){
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<AuditCycleDashboard />
						<NotificationBox/>
					</div>
				</div>
			</div>
		);
	},
});

export default Dashboard;
