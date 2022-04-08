import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { pointerStyle } from "../../../styles.js";
import { Check, Pencil } from "../../../components/Icons.jsx";

import { fetchClient, fetchClientBankInfo } from "../../service/client.js";
import Loading from "../../../components/Loading.jsx";

class ProfileInfoPanel extends React.Component {
	static propTypes = {
		clientId: PropTypes.number,
		children: PropTypes.node
	};

	state = {
		client: "",
		bank_info: "",
	};

	componentDidMount() {
		fetchClient().then((client)=>{
			this.setState({client});
		});
		if(this.props.clientId){
			fetchClientBankInfo(this.props.clientId).then((bank_info)=>{
				this.setState({bank_info});
			});
		}
	}

	componentWillReceiveProps(ownProps){
		fetchClient().then((client)=>{
			this.setState({client});
		});
		fetchClientBankInfo(ownProps.clientId).then((bank_info)=>{
			this.setState({bank_info});
		});
	}

	render() {
		if(!this.state.client){
			return <Loading/>;
		}
		let panelClass = "panel-default";
		return (
			<div className="row">
				<div className="col-md-6">
					<div className={"panel " + panelClass}>
						<div className="panel-heading" style={pointerStyle}>
							<Link to="/profile/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
							<h4><Check/> Personal Information</h4>
						</div>
						<table className="table table-striped">
							<colgroup>
								<col style={{width:"40%"}}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="text-muted text-right" style={{"width":"40%"}}>
										Name
									</td>
									<th>{this.state.client.name}</th>
								</tr>
								<tr>
									<td className="text-muted text-right">
										Email
									</td>
									<th>{this.state.client.email}</th>
								</tr>
								<tr>
									<td className="text-muted text-right">
										Phone No.
									</td>
									<th>{this.state.client.phone}</th>
								</tr>
								<tr>
									<td className="text-muted text-right">
										Ho. Address
									</td>
									<th>{this.state.client.address}</th>
								</tr>
								<tr>
									<td className="text-muted text-right">
										Company website URL
									</td>
									<th><a href={this.state.client.company_website_url} target="_blank" rel="noopener noreferrer">{this.state.client.company_website_url}</a></th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="col-md-6">
					<div className={"panel " + panelClass}>
						<div className="panel-heading" style={pointerStyle}>
							<Link to="bankinfo/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
							<h4><Check/> Account Information</h4>
						</div>
						<table className="table table-striped">
							<colgroup>
								<col style={{width:"40%"}}/>
							</colgroup>
							<tbody>
								<tr>
									<td className="text-muted text-right">
										PAN
									</td>
									<th>{this.state.bank_info.pan_number}</th>
								</tr>
								<tr>
									<td className="text-muted text-right">
										GSTIN
									</td>
									<th>{this.state.bank_info.gstin}</th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="col-md-12">
					{this.props.children}
				</div>
			</div>
		);
	}
}
const mapStateToProps = (store) => {
	return{
		clientId: store.client.id
	};
};
export default connect(mapStateToProps)(ProfileInfoPanel);