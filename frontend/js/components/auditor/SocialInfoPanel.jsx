import React from 'react';
import * as ReactRedux from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import { Link } from 'react-router';

import moment from 'moment';

import { momentDateFormat, facebook_client_id, facebook_scope, facebook_fields }  from '../../../config.js';

import { Pencil } from '../Icons.jsx';

import { fetchFacebookInfo, fetchFacebookData, saveFacebookInfo } from '../../auditor/actions/social_info.js';
import Loading from '../Loading.jsx'

var SocialInfoPanelBase = React.createClass({

  getFacebookData: function(){
    const responseFacebook = (response) => {
      this.props.dispatch(fetchFacebookData(this.props.socialInfo, response.accessToken));
    }
    return responseFacebook;
  },

	componentDidMount: function() {
    parent = this;
    this.props.dispatch(fetchFacebookInfo())
	},
	render: function(){
    if(! this.props.socialInfo){
			return <Loading/>;
		}
    if(this.props.socialInfo.id === null || !this.props.socialInfo.is_verified){
      var facebookWarning = (
        <FacebookLogin
          appId={facebook_client_id}
          autoLoad={false}
          fields={facebook_fields}
          scope={facebook_scope}
          callback={this.getFacebookData()}
          cssClass="kep-login-facebook"
          icon="fa-facebook"
          textButton="Continue with facebook"
        />
      );
    }
    else{
      var facebookWarning = (
        <p className="text-success">Thank you for verifying with Facebook</p>
      )
    }
		return (
			<div>
				{facebookWarning}
        <br/>
        <br/>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		socialInfo: store.socialInfo
	};
};

export { SocialInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(SocialInfoPanelBase);
