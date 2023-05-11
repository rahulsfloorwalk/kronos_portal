import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import { fetchUser } from "../actions/user.js";
import { fetchPreferences } from "../service/preferences.js";

import ProfileInfoPanel from "./ProfileInfoPanel.jsx";
// import SocialInfoPanel from "./SocialInfoPanel.jsx";
import BankInfoPanel from "./BankInfoPanel.jsx";
import AdditionalInfoPanel from "./AdditionalInfoPanel.jsx";
import IdProofPanel from "./IdProofPanel.jsx";

import Panel from "../../components/Panel.jsx";
import { Cross, Check } from "../../components/Icons.jsx";
import ProfilePercentage from "./ProfilePercentage.jsx";

class DetailsPage extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		dispatch: PropTypes.func.isRequired,
		user: PropTypes.shape({
			email: PropTypes.string,
		}),
		profileInfo: PropTypes.shape({
			mobile_number: PropTypes.string,
			whatsapp_number: PropTypes.string,
			certification_score: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		preferences: {},
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	componentDidMount() {
		this.setLoading(true);
		this.props.dispatch(fetchUser());
		fetchPreferences().done((preferences) => {
			this.setState({preferences});
		}).always(() => this.setLoading(false));
	}

	componentWillReceiveProps() {
		this.setLoading(true);
		fetchPreferences().done((preferences) => {
			this.setState({preferences});
		}).always(() => this.setLoading(false));
	}
	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-4">
						<Panel title="Account Details" body={true}>
							<p>Profile Completion:</p>
							<ProfilePercentage />
							<p>Certification Score: &nbsp; {this.props.profileInfo.certification_score ?
								<b>{this.props.profileInfo.certification_score} %</b>
								: <b>NA &nbsp;&nbsp;<Link to='/certification'> (View)</Link></b> }
							</p>
							<p>Email: <b>{this.props.user.email}</b></p>
							<p>Mobile Number: &nbsp;
								{ this.props.profileInfo.mobile_number ?
									<b>{this.props.profileInfo.mobile_number} &nbsp;&nbsp; <Link to="/details/mobile_number/edit">Change</Link></b>
									: <Link to="/details/mobile_number/edit"><b className="text-danger">Please click here to update your Mobile Number.</b></Link> }
							</p>
							<p>Whatsapp Number: &nbsp;
								{ this.props.profileInfo.whatsapp_number ?
									<b>{this.props.profileInfo.whatsapp_number} &nbsp;&nbsp; <Link to="/details/whatsapp_number/edit">Change</Link></b>
									: <Link to="/details/whatsapp_number/edit"><b className="text-danger">Please click here to update your Whatsapp Number.</b></Link> }
							</p>
							<p>Password: <a href="/auth/password_change">Click here</a> to change your password.</p>
							Receive New Opportunities:
							<Link to="details/preferences/edit" className=""> change </Link>
							<ul style={{"listStyleType":"none"}}>
								<li>{this.state.preferences.receive_new_opportunities_email ? <Check/> : <Cross/>} on Email</li>
								<li>{this.state.preferences.receive_new_opportunities_sms ? <Check/> : <Cross/>} on SMS</li>
								<li>{this.state.preferences.receive_transactional_whatsapp_message ? <Check/> : <Cross/>} on Whatsapp</li>
							</ul>
							{/* <p className="text-muted"><small>If you want to change your mobile number or email, please contact us.</small></p> */}
						</Panel>
					</div>
					<div className="col-md-8">
						{/*<ProfilePercentage/>*/}
						<ProfileInfoPanel/>
						<BankInfoPanel/>
						{/* <SocialInfoPanel/> */}
						<IdProofPanel/>
						<AdditionalInfoPanel/>
					</div>
					{this.props.children}
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		user: store.user || {},
		profileInfo: store.profileInfo || {}
	};
};

export default ReactRedux.connect(mapStoreToProps)(DetailsPage);
