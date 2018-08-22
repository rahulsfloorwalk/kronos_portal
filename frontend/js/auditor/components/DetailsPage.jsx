import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchUser } from '../actions/user.js';
import { fetchPreferences } from '../service/preferences.js';

import ProfileInfoPanel from './ProfileInfoPanel.jsx';
import SocialInfoPanel from './SocialInfoPanel.jsx';
import BankInfoPanel from './BankInfoPanel.jsx';
import AdditionalInfoPanel from './AdditionalInfoPanel.jsx';
import IdProofPanel from './IdProofPanel.jsx';
import ProfilePercentage from "./ProfilePercentage.jsx";

import Panel from '../../components/Panel.jsx';
import { Pencil, Cross, Check } from '../../components/Icons.jsx';

class DetailsPage extends React.Component {
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
						<p>Email: <b>{this.props.user.email}</b></p>
						<p>Mobile Number: &nbsp;
						{ this.props.profileInfo.mobile_number ?
							<b>{this.props.profileInfo.mobile_number}</b>
							: <Link to="/details/mobile_number/edit"><b className="text-danger">Please click here to update your Mobile Number.</b></Link> }
						</p>
						<p>Password: <a href="/auth/password_change">Click here</a> to change your password.</p>
						Receive New Opportunities:
						<Link to="details/preferences/edit" className=""> change </Link>
						<ul style={{"listStyleType":"none"}}>
						<li>{this.state.preferences.receive_new_opportunities_email ? <Check/> : <Cross/>} on Email</li>
						<li>{this.state.preferences.receive_new_opportunities_sms ? <Check/> : <Cross/>} on SMS</li>
						</ul>
						<p className="text-muted"><small>If you want to change your mobile number or email, please contact us.</small></p>
					</Panel>
				</div>
				<div className="col-md-8">
			{/*<ProfilePercentage/>*/}
					<ProfileInfoPanel/>
					<BankInfoPanel/>
					<SocialInfoPanel/>
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
