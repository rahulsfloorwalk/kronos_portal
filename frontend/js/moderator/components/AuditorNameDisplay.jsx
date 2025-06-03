import React, { Component } from "react";
import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";

export default class AuditorNameDisplay extends Component {
	static propTypes = {
		user: PropTypes.shape({
			profileinfo: PropTypes.shape({
				first_name: PropTypes.string,
				last_name: PropTypes.string,
				mobile_number: PropTypes.string,
				whatsapp_number: PropTypes.string
			}),
			agencyuser: PropTypes.shape({
				full_name: PropTypes.string,
			}),
			mobile_numbers: PropTypes.array
		}).isRequired,
		id: PropTypes.number,
	};

	state = {};

	render() {
		let auditorPhoneLink = null;
		let auditorWhatsappLink = null;
		let auditorName = "";
		let whatsappUrl = "";
		if (this.props.user.profileinfo == null) {
			const phoneNumber = this.props.user.mobile_numbers[0].mobile_number || "";
			const cleanedPhoneNumber = phoneNumber.replace(/[+-\s]/g, "");
			whatsappUrl = `https://wa.me/${cleanedPhoneNumber}`;
			auditorPhoneLink = (<a href={`tel: ${this.props.user.mobile_numbers[0].mobile_number}`}> {this.props.user.mobile_numbers[0].mobile_number}</a >);
			auditorName = this.props.user.agencyuser.full_name;
		}
		else {
			// const phoneNumber = this.props.user.profileinfo.mobile_number || "";
			const whatsappNumber = this.props.user.profileinfo.whatsapp_number || "";
			const cleanedPhoneNumber = whatsappNumber.replace(/[+-\s]/g, "");
			whatsappUrl = `https://wa.me/${cleanedPhoneNumber}`;
			auditorPhoneLink = (<a href={`tel: ${this.props.user.profileinfo.mobile_number}`}> {this.props.user.profileinfo.mobile_number}</a >);
			auditorWhatsappLink = (<a href={whatsappUrl}
				target="_blank"
				rel="noopener noreferrer"
				style={{ textDecoration: "none", marginLeft: "5px", }}
				title={`Message ${auditorName} on WhatsApp`}>{this.props.user.profileinfo.whatsapp_number}</a>);
			auditorName = this.props.user.profileinfo.first_name + " " + this.props.user.profileinfo.last_name;
		}
		return (
			<div>

				{(location.href==`http://localhost:8080/static/moderator#/audit_store/${this.props.id}/report` && this.props.user.profileinfo.whatsapp_number) ?
				<>
					<div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:".3rem"}}><b>{auditorName}</b> | ({auditorPhoneLink}) |</div>
					<div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:".3rem"}}>
						(
						<a
							href={whatsappUrl}
							target="_blank"
							rel="noopener noreferrer"
							style={{ textDecoration: "none", marginLeft: "5px", }}
							title={`Message ${auditorName} on WhatsApp`}
						>
							<FaWhatsapp size={17} color="#25D366"/>
						</a> :- {auditorWhatsappLink}) {" "}
						|
					</div>
				</>
					: <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:".3rem"}}><b>{auditorName}</b>  ({auditorPhoneLink}) </div>
				}
			</div>

		);
	}
}
