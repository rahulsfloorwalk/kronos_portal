import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import NotificationBox from './NotificationBox.jsx';
import StatCard from './StatCard.jsx';
import ProfileCard from './ProfileCard.jsx';
import RatingCard from './RatingCard.jsx';

import { fetchProfileInfo, fetchAuditorStats, fetchAuditorScore } from '../../auditor/actions/dashboard.js';

var Dashboard = React.createClass({
	componentWillMount: function(){
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchAuditorStats());
		this.props.dispatch(fetchAuditorScore());
	},
	render: function(){
		let stats = this.props.auditorStats || {};
		let score = this.props.auditorScore || {};
		console.log(stats)
		if( this.props.firstName && this.props.lastName){
			return (
			<div>
				<h3 className="page-header">Welcome {this.props.firstName} {this.props.lastName}</h3>
				<div className="row">
					<div className="col-md-8">
						<RatingCard
							score={score}
						/>
					</div>
					<div className="col-md-4">
						<ProfileCard
							firstName={this.props.firstName}
							lastName={this.props.lastName}
							city={this.props.city.name}
							phone={this.props.phone}
						/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-8">
						<StatCard title="Audits Applied" image="/static/img/apply.png" count={stats.applied}/>
						<StatCard title="Audits Assigned"  image="/static/img/assign.png" count={stats.assigned}/>
						<StatCard title="Reports Completed"  image="/static/img/report.png" count={stats.completed}/>
						<StatCard title="Payments Pending "  image="/static/img/money.png" count={stats.pending_payment}/>
					</div>
					<div className="col-md-4">
						<NotificationBox/>
					</div>
				</div>
				<div className="row">

				</div>
			</div>
			);
		}
		return (
			<div className="jumbotron text-center">
				<h2>Welcome to FloorWalk!</h2>
				<h3>Please <Link className="btn btn-success" to="details/profile/edit"> Click Here</Link> to begin by saving your details</h3>
				<p>We need to know more about you before we can assign audits to you.</p>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		firstName: store.profileInfo.first_name,
		lastName: store.profileInfo.last_name,
		city: store.profileInfo.city,
		phone: store.profileInfo.mobile_number,
		auditorStats: store.auditorStats,
		auditorScore: store.auditorScore
	};
};

export default ReactRedux.connect(mapStoreToProps)(Dashboard);
