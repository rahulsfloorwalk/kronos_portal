import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { fetchClient } from "../../service/client.js";

import { King, Pencil, Retweet, Home, Bishop, Knight, Education,Info } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";
import NavLink from "../../../components/NavLink.jsx";

export default class ClientDetail extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}),
	};
	state = {
		isModalOpen : false,
		errorMessage : "",
	};

	// componentDidMount() {
	// 	fetchClient(this.props.params.clientId).done((client)=> this.setState({client}));
	// }

	componentDidMount() {
		fetchClient(this.props.params.clientId)
			.then((client) => {
				if (client.detail && client.detail === "You are not authorized to view this data.") {
					this.setState({isModalOpen:true});
					this.setState({errorMessage : client.detail});
				} else {
					this.setState({ client });
				}
			});
	}
	// componentWillReceiveProps(nextProps) {
	// 	// fetchClient(nextProps.params.clientId).done((client)=> this.setState({client}));
	// }

	componentWillReceiveProps(nextProps) {
		fetchClient(nextProps.params.clientId)
			.then((client) => {
				if (client.detail && client.detail === "You are not authorized to view this data.") {
					this.setState({isModalOpen:true});
					this.setState({errorMessage : client.detail});
				} else {
					this.setState({ client });
				}
			});
	}


	render() {
		if(! this.state.client && this.state.errorMessage ===""){
			return <Loading/>;
		}else if (! this.state.client && this.state.errorMessage ==="You are not authorized to view this data."){
			return(
				<div className="modal" tabIndex="-1" style={{ display: "block" }}>
					<div className="modal-backdrop fade in" style={{ zIndex: "1060", height: "100%" }}/>
					<div className="modal-dialog" style={{ zIndex: "1070" }}>
						<div className="modal-content">
							<div className="modal-header">
								<h3 className="modal-title" style={{color:"red"}}>Alert :</h3>
							</div>
							<div className="modal-body">
								<h3>{this.state.errorMessage}</h3>
							</div>
						</div>
					</div>
				</div>
			);
		}
		var editLink = `/client/${this.props.params.clientId}/edit`;
		var clientLogo = this.state.client.logo_url ? <img style={{"padding":"10px"}} className="img-responsive" src={this.state.client.logo_url}/> : "";
		let brandLogo = this.state.client.brand_logo_url ? <img style={{"padding":"10px"}} className="img-responsive" src={this.state.client.brand_logo_url}/> : "";
		return (
			<div>
				{this.state.isModalOpen ? (
					<div className="modal" tabIndex="-1" style={{ display: "block" }}>
						<div className="modal-backdrop fade in" style={{ zIndex: "1060", height: "100%" }}/>
						<div className="modal-dialog" style={{ zIndex: "1070" }}>
							<div className="modal-content">
								<div className="modal-header">
									<h3 className="modal-title" style={{color:"red"}}>Alert :</h3>
								</div>
								<div className="modal-body">
									<h3>{this.state.errorMessage}</h3>
								</div>
							</div>
						</div>
					</div>)
					:
					<div>
						<ol className="breadcrumb">
							<li><Link to="/client">Clients</Link></li>
							<li className="active"><King/> {this.state.client.name}</li>
						</ol>
						<div className="row">
							<div className="col-md-4">
								<div className="panel panel-primary">
									<div className="panel-heading">
										<Link to={editLink} className="btn btn-default btn-sm pull-right"><Pencil/></Link>
										<h4>
											<King/> Client Info
										</h4>
									</div>
									{clientLogo}
									<table className="table table-striped">
										<tbody>
											<tr><td className="text-right">Name</td><td><b>{ this.state.client.name }</b></td></tr>
											<tr><td className="text-right">Brand Name</td><td><b>{ this.state.client.brand_name }</b></td></tr>
											<tr><td className="text-right">Email</td><td><b>{ this.state.client.email }</b></td></tr>
											<tr><td className="text-right">Phone</td><td><b>{ this.state.client.phone }</b></td></tr>
										</tbody>
									</table>
									{brandLogo}
								</div>
							</div>
							<div className="col-md-8">
								<ul className="nav nav-tabs">
									<NavLink to={`/client/${this.props.params.clientId}/audit_cycle`}><Retweet/> Audit Cycles</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/questionnaire_type`}>Questionnaire Types</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/store`}><Home/> Stores</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/client_user`}><Bishop/> Client Users</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/client_manager`}><Knight/> Managers</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/client_trainer`}><Education/> Trainers</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/client_requirements`}><Info/> Client Requirements</NavLink>
									<NavLink to={`/client/${this.props.params.clientId}/client_qa_listing`}><Knight/> QA Listing</NavLink>
								</ul>
								{this.props.children}
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}
