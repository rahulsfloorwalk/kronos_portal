import React from 'react';
import * as ReactRedux from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import { Link } from 'react-router';

import { pointerStyle } from '../../styles.js';

import moment from 'moment';

import { momentDateFormat, facebook_client_id, facebook_scope, facebook_fields }  from '../../../config.js';

import { Pencil, Check, Warning } from '../../components/Icons.jsx';

import { fetchFacebookInfo, saveFacebookInfo } from '../actions/social_info.js';
import { fetchProfileInfo } from '../actions/profile_info.js';
import FBGraph from '../../auditor/service/fbgraph.js';
import Loading from '../../components/Loading.jsx'

import { fetchConfig } from '../service/config.js';

var SocialInfoPanelBase = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			expanded: false,
		};
	},
	toggleExpand: function(){
		this.setState({expanded: !this.state.expanded});
	},
	setLoading: function(loading){
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	},

	facebookResponse: function(response){
		if(response.accessToken){
			let fbapi = new FBGraph(response.accessToken);
			this.setLoading(true);
			fetchConfig()
				.then((config) => fbapi.me(config.FB_FIELDS))
				.then((fbResponse) => this.props.dispatch(saveFacebookInfo(fbResponse, response.accessToken)))
				.then(() => this.props.dispatch(fetchProfileInfo()))
				.then(() =>this.setLoading(false));
		}
	},

	componentDidMount: function() {
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchFacebookInfo()),
			fetchConfig().then((config) => this.setState({
				FB_FIELDS: config.FB_FIELDS,
				FB_SCOPE: config.FB_SCOPE,
				FB_CLIENT_ID: config.FB_CLIENT_ID,
			})),
		]).then(() => this.setLoading(false))
	},
	render: function(){
		if(! this.props.socialInfo || this.state.loading || !this.state.FB_CLIENT_ID){
			return <Loading/>;
		}

		let panelClass = this.props.socialInfo.id && this.props.socialInfo.is_verified ? "panel-success-hoverable" : "panel-default";
		let panelIcon = this.props.socialInfo.id && this.props.socialInfo.is_verified ? <Check/> : <Warning/>;

		return (
			<div className={"panel " + panelClass}>
				<div className="panel-heading" style={pointerStyle} onClick={this.toggleExpand}>
					<h4>{panelIcon} Social Connections</h4>
				</div>
				{ this.state.expanded || this.props.socialInfo.id === null || !this.props.socialInfo.is_verified ?
				<div className="panel-body">
				{ this.props.socialInfo.id === null || !this.props.socialInfo.is_verified ?
					<div className="text-center">
					<FacebookLogin
						appId={this.state.FB_CLIENT_ID}
						autoLoad={false}
						fields={this.state.FB_FIELDS}
						scope={this.state.FB_SCOPE}
						callback={this.facebookResponse}
						size="metro"
						cssClass="kep-login-facebook"
						icon="fa fa-facebook"
						textButton="CONNECT FACEBOOK"
						disableMobileRedirect={true}
					/>
					<p><small className="text-muted">Connecting your Facebook account will improve chances of your application getting approved.</small></p>
					</div>
				: 
						<p><Check/> Your connected Facebook account is <b>{this.props.socialInfo.profile_data.name}</b></p>
				}
				</div> 
				: null }
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		socialInfo: store.socialInfo
	};
};

export default ReactRedux.connect(mapStoreToProps)(SocialInfoPanelBase);
