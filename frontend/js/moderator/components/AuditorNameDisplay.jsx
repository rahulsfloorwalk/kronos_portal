import React, { Component } from "react";
import PropTypes from "prop-types";
import { Envelope, Earphone } from "../../components/Icons.jsx";
export default class AuditorNameDisplay extends Component{
  static propTypes = {
		user: PropTypes.shape({
			profileinfo: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        mobile_number: PropTypes.string
      }),
      agencyuser: PropTypes.shape({
        full_name: PropTypes.string,
      }),
      mobile_numbers: PropTypes.array
		}).isRequired,
	};

  state = {};

  render(){
    let auditorPhoneLink = null;
    let auditorName = "";
    if(this.props.user.profileinfo == null){
      auditorPhoneLink = (<a href={`tel:${this.props.user.mobile_numbers[0].mobile_number}`}>{this.props.user.mobile_numbers[0].mobile_number}</a>);
      auditorName = this.props.user.agencyuser.full_name;
    }
    else{
      auditorPhoneLink = (<a href={`tel:${this.props.user.profileinfo.mobile_number}`}>{this.props.user.profileinfo.mobile_number}</a>);
      auditorName = this.props.user.profileinfo.first_name + " " + this.props.user.profileinfo.last_name;
    }
    return(
      <div><b>{auditorName}</b> ({auditorPhoneLink})</div>
    );
  }
}
