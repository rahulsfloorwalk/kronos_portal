import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import NotificationBox from './../components/NotificationBox.jsx';
import StatCard from './../components/StatCard.jsx';
import ProfileCard from './../components/ProfileCard.jsx';
import RatingCard from './../components/RatingCard.jsx';

import Loading from '../../components/Loading.jsx';

import { fetchProfileInfo, fetchAuditorStats, fetchAuditorScore } from '../actions/dashboard.js';

class Dashboard extends React.Component {
    state = {
        loading: false,
    };

    setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};

    componentWillMount() {
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchProfileInfo()),
			this.props.dispatch(fetchAuditorStats()),
			this.props.dispatch(fetchAuditorScore()),
		]).then(()=>this.setLoading(false));
	}

    render() {
		if(this.state.loading){
			return <Loading/>;
		}
		let stats = this.props.auditorStats || {};
		let score = this.props.auditorScore || {};
		console.log(stats)
		if( this.props.firstName && this.props.lastName){
			return (
			<div>
				{/*<h3 className="page-header">Welcome {this.props.firstName} {this.props.lastName}</h3>*/}
				<div className="row">
					<div className="col-md-8">
						<br/>
						<br/>
						<ProfileCard
							firstName={this.props.firstName}
							lastName={this.props.lastName}
							city={this.props.city.name}
							phone={this.props.phone}
						/>
						<br/>
						<div className="row">
							<div className="col-md-6">
							<StatCard 
								title="Audits Applied" 
								image="/static/img/application_100.png" count={stats.applied}/>
							</div>
							<div className="col-md-6">
							<StatCard 
								title="Audits Assigned"  
								image="/static/img/thumbsup_100.png" count={stats.assigned}/>
							</div>
							<div className="col-md-6">
							<StatCard 
								title="Reports Completed"  
								image="/static/img/checkmark_100.png" count={stats.completed}/>
							</div>
							<div className="col-md-6">
							<StatCard 
								title="Payments Pending "  
								image="/static/img/money_100.png" count={stats.pending_payment}/>
							</div>
						</div>
					</div>
					<div className="col-md-4">
					<NotificationBox/>
					</div>
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
	}
}

var mapStoreToProps = function(store){
	return {
		firstName: store.profileInfo.first_name,
		lastName: store.profileInfo.last_name,
		city: store.profileInfo.city || {},
		phone: store.profileInfo.mobile_number,
		auditorStats: store.auditorStats,
		auditorScore: store.auditorScore
	};
};

export default ReactRedux.connect(mapStoreToProps)(Dashboard);
