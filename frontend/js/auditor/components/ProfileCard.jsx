import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

// import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

class ProfileCard extends React.Component {
    componentWillMount() {
		// this.props.dispatch(fetchProfileInfo());
	}

    render() {
		return (
      <div className=" text-center">
          <img src="/static/img/dp.png" alt="profile pic" className="img-circle" width="100" height="100" />
          <h2>{this.props.firstName} {this.props.lastName}</h2>
          <h4>{this.props.city}&emsp;&emsp;&emsp;{ this.props.phone ? this.props.phone : <Link className="text-danger" to="/details/mobile_number/edit"><b>Update Mobile Number</b></Link>}</h4>
      </div>
		);
	}
}

export default ProfileCard;
