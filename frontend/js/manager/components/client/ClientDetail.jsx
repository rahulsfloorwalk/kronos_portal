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
		expandedImages : {
			"Brand Logo": false,
			"Background Image": false,
		},
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

	toggleImageCard(label) {
		this.setState((prevState) => ({
			expandedImages: {
				...prevState.expandedImages,
				[label]: !prevState.expandedImages[label],
			},
		}));
	}
	renderScoreScaleRow() {
		const scoreScale = this.state.client.score_scale;
		if (!scoreScale) return null;

		const colors = {
			poor: "rgb(255, 194, 153)",
			average: "rgb(255, 255, 153)",
			good: "rgb(234, 255, 153)",
			excellent: "rgb(193, 255, 153)",
		};

		const entries = Object.keys(scoreScale).map((key) => ({
			key,
			range: scoreScale[key] ? scoreScale[key] : "---",
			color: colors[key] || "#95a5a6",
		}));

		return (
			<tr>
				<td className="text-right" style={{ verticalAlign: "top", paddingTop: "14px" }}>Score Scale</td>
				<td>
					<div style={{ marginTop: "8px" }}>
						{entries.map((entry) => (
							<div key={entry.key} style={{ display: "flex", alignItems: "center", marginBottom: "3px" }}>
								<span style={{
									display: "inline-block",
									width: "10px",
									height: "10px",
									backgroundColor: entry.color,
									borderRadius: "2px",
									marginRight: "6px",
									flexShrink: 0,
								}}/>
								<span style={{ fontSize: "12px" }}>
									<b style={{ textTransform: "capitalize" }}>{entry.key}</b>: {entry.range}
								</span>
							</div>
						))}
					</div>
				</td>
			</tr>
		);
	}

	isValidColor(color) {
		if (!color) return false;
		const s = new Option().style;
		s.color = color;
		return s.color !== "";
	}

	renderImageCard(label, src) {
		if (!src) return null;
		const isExpanded = this.state.expandedImages[label];

		return (
			<div style={{
				border: "1px solid #e0e0e0",
				borderRadius: "6px",
				padding: "10px",
				marginBottom: "10px",
			}}>
				<div
					onClick={() => this.toggleImageCard(label)}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						cursor: "pointer",
						marginBottom: isExpanded ? "8px" : "0",
					}}
				>
					<span style={{
						fontSize: "12px",
						color: "#888",
						letterSpacing: "0.5px",
					}}>
						{label}
					</span>
					<span style={{
						fontSize: "12px",
						color: "#888",
						transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
					}}>
						▼
					</span>
				</div>

				{isExpanded && (
					<div style={{
						height: "120px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#fafafa",
						borderRadius: "4px",
						overflow: "hidden",
					}}>
						<img
							src={src}
							alt={label}
							style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }}
						/>
					</div>
				)}
			</div>
		);
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
									{/* {clientLogo} */}
									<div style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										padding: "16px",
										borderBottom: "1px solid #eee",
									}}>
										{this.state.client.logo_url ? (
											<img
												src={this.state.client.logo_url}
												alt="Client Logo"
												style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain" }}
											/>
										) : (
											<span style={{ color: "#aaa", fontSize: "13px" }}>No logo uploaded</span>
										)}
									</div>
									<table className="table table-striped">
										<tbody>
											<tr><td className="text-right">Name</td><td><b>{ this.state.client.name }</b></td></tr>
											<tr><td className="text-right">Brand Name</td><td><b>{ this.state.client.brand_name }</b></td></tr>
											<tr><td className="text-right">Email</td><td><b>{ this.state.client.email }</b></td></tr>
											<tr><td className="text-right">Phone</td><td><b>{ this.state.client.phone }</b></td></tr>
											<tr>
												<td className="text-right">Primary Color</td>
												<td style={{ display: "flex", alignItems: "center" }}>
													<span style={{
														display: "inline-block",
														width: "16px",
														height: "16px",
														backgroundColor: this.isValidColor(this.state.client.primary_color)
															? this.state.client.primary_color
															: "#fff",
														border: this.isValidColor(this.state.client.primary_color) ? "1px solid #ccc" : "1px dashed red",
														borderRadius: "3px",
														marginRight: "8px",
													}}/>
													<b>{ this.state.client.primary_color }</b>
												</td>
											</tr>
											<tr>
												<td className="text-right">Secondary Color</td>
												<td style={{ display: "flex", alignItems: "center" }}>
													<span style={{
														display: "inline-block",
														width: "16px",
														height: "16px",
														backgroundColor: this.isValidColor(this.state.client.secondary_color)
															? this.state.client.secondary_color
															: "#fff",
														border: this.isValidColor(this.state.client.secondary_color) ? "1px solid #ccc" : "1px dashed red",
														borderRadius: "3px",
														marginRight: "8px",
													}}/>
													<b>{ this.state.client.secondary_color }</b>
												</td>
											</tr>
											{this.renderScoreScaleRow()}
										</tbody>
									</table>
									{/* {brandLogo}
									{backgroundImageUrl} */}
									<div style={{ padding: "12px" }}>
										{this.renderImageCard("Brand Logo", this.state.client.brand_logo_url)}
										{this.renderImageCard("Background Image", this.state.client.background_image_url)}
									</div>
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
									<NavLink to={`/client/${this.props.params.clientId}/client_dashboard_visibility`}><Knight/> Dashboard Visibility</NavLink>
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
