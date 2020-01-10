import React from "react";
import PropTypes from "prop-types";

import { hashHistory } from "react-router";

import FormInput from "../../components/FormInput.jsx";

import { login } from "../service/auth.js";
import { affectInputEventToComponent } from "../../react_utils.js";

// import floorwalkLogoUrl from "../../../img/logo_3_500x100.png";
import floorwalkLogoUrl from "../../../img/logo_200x120.png";

export default class Login extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			query: PropTypes.shape({
				logout: PropTypes.string,
			}),
		}),
	};

	state = {
		username: "",
		password: "",
		failed: false,
		errors: []
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	loginFormSubmit = (e) => {
		e.preventDefault();
		login(this.state.username, this.state.password).then(() => {
			hashHistory.push("/");
		}, () => {
			this.setState({failed: true});
		});
	};

	render() {
		let failedBox;
		if( this.state.failed){
			failedBox = (<div className="alert alert-warning">Login Failed</div>);
		}
		let logoutMessage;
		if( this.props.location.query.logout){
			logoutMessage = (<div className="alert alert-success">Logged Out Successfully</div>);
		}
		return (
			<div className="container">
				<h1 className="page-header">
					<div className="row">
						<div className="col-md-6 col-md-offset-3">
							<a href="http://floorwalk.in">
								<img className="img-responsive" style={{marginLeft:"auto",marginRight:"auto"}} src={floorwalkLogoUrl}/>
							</a>
						</div>
					</div>
				</h1>
				<div className="row">
					<div className="col-md-6 col-md-offset-3">
						<div className="panel panel-primary">
							<div className="panel-heading">
								<h3 className="panel-title">FloorWalk Moderator Login</h3>
							</div>
							<div className="panel-body">
								{logoutMessage}
								{failedBox}
								<form onSubmit={this.loginFormSubmit}>
									<div className="form-group">
										<FormInput label="Email Address" value={this.state.username} name="username" onChange={this.inputChanged} errors={this.state.errors.username}/>
									</div>
									<div className="form-group">
										<FormInput label="Password" type="password" value={this.state.password} name="password" onChange={this.inputChanged} errors={this.state.errors.password}/>
									</div>
									<div className="form-group">
										<button className="btn btn-primary btn-lg" type="submit">Login</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>);
	}
}

