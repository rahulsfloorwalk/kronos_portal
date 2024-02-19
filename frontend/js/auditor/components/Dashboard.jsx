import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

// import NotificationBox from "./../components/NotificationBox.jsx";
import StatCard from "./../components/StatCard.jsx";
import ProfileCard from "./../components/ProfileCard.jsx";

import { Tasks } from "../../components/Icons.jsx";

import Loading from "../../components/Loading.jsx";

import applicationImgUrl from "../../../img/application_100.png";
import thumbsUpImgUrl from "../../../img/thumbsup_100.png";
import checkmarkImgUrl from "../../../img/checkmark_100.png";
import moneyImgUrl from "../../../img/money_100.png";
import UserImgUrl from "../../../img/user_100.png";
import oppotunitiesImgUrl from "../../../img/file_100.png";

import { fetchProfileInfo, fetchAuditorStats, fetchAuditorScore } from "../actions/dashboard.js";
import { getProfileCompletionPercentage } from "../service/dashboard.js";

class Dashboard extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		auditorStats: PropTypes.shape({ }),
		firstName: PropTypes.string,
		lastName: PropTypes.string,
		gender: PropTypes.string,
		phone: PropTypes.string,
		city: PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string,
		}),
	};

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
			getProfileCompletionPercentage().then((percentage) => {
				this.setState({percentage});
			})
		]).then(()=>this.setLoading(false));
	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		}
		let stats = this.props.auditorStats || {};
		if( this.props.firstName && this.props.lastName){
			return (
				<div>
					{/*<h3 className="page-header">Welcome {this.props.firstName} {this.props.lastName}</h3>*/}
					<div className="row">
						<br />
						<div className="col-md-3">
							<div className="panel panel-primary">
								<div className="panel-heading">
									<h4 className="panel-title">Your Profile</h4>
								</div>
								<div className="panel-body">
									<ProfileCard
										firstName={this.props.firstName}
										lastName={this.props.lastName}
										gender={this.props.gender}
										city={this.props.city.name}
										phone={this.props.phone}
									/>
								</div>
							</div>
						</div>
						<div className="col-md-9">
							<div className="panel panel-primary">
								<div className="panel-heading">
									<h4 className="panel-title">
										<Tasks/> Your Summary
									</h4>
								</div>
								<div className="row">
									<div className="col-md-6">
										<Link to="/audit" style={{ color: "black" }}>
											<StatCard
												title="View Opportunities"
												image={oppotunitiesImgUrl} count={stats.available_audits}/>
										</Link>
									</div>
									<div className="col-md-6" style={{ marginBottom: "15px" }}>
										<Link to="/details" style={{ color: "black" }}>
											<StatCard
												title="Profile Completion %"
												image={UserImgUrl}
												count={this.state.percentage}
											/>
										</Link>
									</div>
									<div className="col-md-6">
										<Link to="/applied_audits" style={{ color: "black" }}>
											<StatCard
												title="Audits Applied"
												image={applicationImgUrl} count={stats.applied}/>
										</Link>
									</div>
									<div className="col-md-6">
										<Link to="/applied_audits" style={{ color: "black" }}>
											<StatCard
												title="Audits Assigned"
												image={thumbsUpImgUrl} count={stats.assigned}/>
										</Link>
									</div>
									<div className="col-md-6">
										<Link to="/audit_store" style={{ color: "black" }}>
											<StatCard
												title="Reports Completed"
												image={checkmarkImgUrl} count={stats.completed}/>
										</Link>
									</div>
									<div className="col-md-6">
										<Link to="/payment" style={{ color: "black" }}>
											<StatCard
												title="Payments Pending "
												image={moneyImgUrl} count={stats.pending_payment}/>
										</Link>
									</div>
								</div>
							</div>
						</div>
						{/* <div className="col-md-4">
							<NotificationBox/>
						</div> */}
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
		gender: store.profileInfo.gender,
		city: store.profileInfo.city || {},
		phone: store.profileInfo.mobile_number,
		auditorStats: store.auditorStats,
		auditorScore: store.auditorScore
	};
};

export default ReactRedux.connect(mapStoreToProps)(Dashboard);
