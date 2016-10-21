import React from 'react';

import Header from './Header.jsx';
import Footer from '../Footer.jsx';

var Dashboard = React.createClass({
	render: function(){
		return (
			<div>
				<h1 className="page-header">Dashboard</h1>
				<p className="text-muted text-center">There's nothing here right now.</p>
			</div>
		);
	},
});

export default Dashboard;
