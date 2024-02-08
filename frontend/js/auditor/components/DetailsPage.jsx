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
import { Cross, Check,Lock } from "../../components/Icons.jsx";
import ProfilePercentage from "./ProfilePercentage.jsx";
import { deactivateAuditorfromAuditorPortal } from "../../manager/service/auditor.js";
import Alert from "react-s-alert";

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
			user_id: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		preferences: {},
		isModalOpen: false,
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
		// let statusButton;
		// statusButton = (<button onClick={() => {const confirmed = window.confirm("Are you sure you want to deactivate your account?");
		// 	  if (confirmed) {
		// 		deactivateAuditorfromAuditorPortal(this.props.profileInfo.user_id).then((auditor) => {
		// 		  this.setState({ auditor });
		// 		  Alert.success("AUDITOR DEACTIVATED. If you want to reactivate your Account, please contact us at contactus@floorwalk.in");
		// 		});
		// 	  } else {
		// 		Alert.info("Deactivation canceled");
		// 	  }
		// 	}}className="btn btn-default">
		// 		<Lock /> Deactivate
		//   	</button>);

		const statusButton = (
			<button onClick={() => this.setState({ isModalOpen: true })} className="btn btn-default " >
				<Lock /> Deactivate My profile
			</button>
		);

		return (
			<div>
				<div className="row">
					<div className="col-md-4">
						<Panel title="Account Details" body={true}>
							<p>Profile Completion:</p>
							<ProfilePercentage />
							<p>Certification Score: &nbsp; {this.props.profileInfo.certification_score ?
								<b>{this.props.profileInfo.certification_score} %</b>
								: <b>N/A &nbsp;&nbsp;<Link to='/certification'> (View)</Link></b> }
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
							<div className="panel-heading ">
								<span className="pull-right ">
									{statusButton}
								</span>
							</div>
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
				{this.state.isModalOpen && (
					<div className="modal" tabIndex="-1" style={{ display: "block" }}>
						<div className="modal-backdrop fade in" style={{ zIndex: "1060", height: "100%" }} onClick={() => this.setState({ isModalOpen: false })}/>
						<div className="modal-dialog" style={{ zIndex: "1070" }}>
							<div className="modal-content">
								<div className="modal-header">
									<button type="button" className="close" onClick={() => this.setState({ isModalOpen: false })}>
										&times;
									</button>
									<h4 className="modal-title">Deactivate Confirmation :</h4>
								</div>
								<div className="modal-body">
									<p>Are you sure you want to deactivate your account?</p>
									<p>If you deactivate your account, you will not be able to login.</p>
									<p>
										If you want to reactivate your Account, please contact us at{" "}
										<a href="mailto:contactus@floorwalk.in">contactus@floorwalk.in</a>.
									</p>
								</div>
								<div className="modal-footer">
									<button className="btn btn-danger" onClick={() => { deactivateAuditorfromAuditorPortal( this.props.profileInfo.user_id ).then((auditor) => {
										this.setState({ auditor });
										Alert.success( "AUDITOR DEACTIVATED. If you want to reactivate your Account, please contact us at contactus@floorwalk.in");
										this.setState({ isModalOpen: false });
									}); }}> Deactivate
									</button>
									<button className="btn btn-secondary" onClick={() => { this.setState({ isModalOpen: false }); }}>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>)}
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
