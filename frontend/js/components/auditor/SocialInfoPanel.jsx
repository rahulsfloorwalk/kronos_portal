import React from 'react';
import * as ReactRedux from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import { Link } from 'react-router';

import moment from 'moment';

import { momentDateFormat, facebook_client_id, facebook_scope, facebook_fields }  from '../../../config.js';

import { Pencil, Check } from '../Icons.jsx';

import { fetchFacebookInfo, saveFacebookInfo } from '../../auditor/actions/social_info.js';
import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';
import FBGraph from '../../auditor/service/fbgraph.js';
import Loading from '../Loading.jsx'

var SocialInfoPanelBase = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
		};
	},
	setLoading: function(loading){
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	},

	facebookResponse: function(response){
		if(response.accessToken){
			let fbapi = new FBGraph(response.accessToken);
			this.setLoading(true);
			fbapi.me(facebook_fields).done((fbResponse) => {
				this.props.dispatch(saveFacebookInfo(fbResponse, response.accessToken)).done(() => {
					this.props.dispatch(fetchProfileInfo());
				}).always(()=>this.setLoading(false));
			});
		}
	},

	componentDidMount: function() {
		this.setLoading(true);
		this.props.dispatch(fetchFacebookInfo()).always(()=>this.setLoading(false));
	},
	render: function(){
		if(! this.props.socialInfo || this.state.loading){
			return <Loading/>;
		}
		return (
			<div className="form-group">
				{ this.props.socialInfo.id === null || !this.props.socialInfo.is_verified ?
					<div className="text-center">
					<FacebookLogin
						appId={facebook_client_id}
						autoLoad={false}
						fields={facebook_fields}
						scope={facebook_scope}
						callback={this.facebookResponse}
						size="metro"
						cssClass="kep-login-facebook"
						icon="fa fa-facebook"
						textButton="CONNECT FACEBOOK"
						disableMobileRedirect={true}
					/>
					<p><small className="text-muted">Connecting your Facebook account will improve chances of your application getting approved.</small></p>
					</div>
				: <div className="panel panel-default">
					<div className="panel-body">
						<p><Check/> Your connected Facebook account is <b>{this.props.socialInfo.profile_data.name}</b></p>
					</div>
				</div> }
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
