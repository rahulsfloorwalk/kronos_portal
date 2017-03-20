import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';

import NotificationBox from './NotificationBox.jsx';

var Dashboard = React.createClass({
	render: function(){
		return (
			<div>
				<h1 className="page-header">Dashboard</h1>
				<div className="row">
					<div className="col-md-12">
						<NotificationBox/>
					</div>
				</div>
			</div>
		);
	},
});

export default Dashboard;
