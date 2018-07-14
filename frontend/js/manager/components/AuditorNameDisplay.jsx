import React, { Component } from "react";
import { Link } from "react-router";
import { Envelope, Earphone } from "../../components/Icons.jsx";
export default class AuditorNameDisplay extends Component{

  constructor(props){
		super(props);
		this.state = {
		};
  }

  render(){
    let auditorEmailLink = (<a href={`mailto:${this.props.user.email}`}>{this.props.user.email}</a>);
    let auditorPhoneLink = null;
    let auditor_name = "";
    let auditorUrl = `/auditor/${this.props.user.id}`;
    if(this.props.user.profileinfo == null){
      auditorPhoneLink = (<a href={`tel:${this.props.user.mobile_numbers[0].mobile_number}`}>{this.props.user.mobile_numbers[0].mobile_number}</a>);
      auditor_name = this.props.user.agencyuser.full_name;
    }
    else{
      auditorPhoneLink = (<a href={`tel:${this.props.user.profileinfo.mobile_number}`}>{this.props.user.profileinfo.mobile_number}</a>);
      auditor_name = (<Link to={auditorUrl}>{this.props.user.profileinfo.first_name} {this.props.user.profileinfo.last_name}</Link>);
    }
    return(
      <div><b>{auditor_name}</b> ({auditorPhoneLink})</div>
    );
  }
}
