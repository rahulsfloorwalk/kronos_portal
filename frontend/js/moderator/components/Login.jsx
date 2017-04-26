import React from 'react';
import * as ReactRedux from 'react-redux';

import { hashHistory } from 'react-router';

import FormInput from '../../components/FormInput.jsx';

import { login } from '../service/auth.js';
import { affectInputEventToComponent } from '../../react_utils.js';

export default React.createClass({
	getInitialState: function(){
		return {
			username: "",
			password: "",
			failed: false,
			errors: []
		};
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	loginFormSubmit: function(e){
		e.preventDefault();
		login(this.state.username, this.state.password).then(() => {
			hashHistory.push('/');
		}, (err) => {
			this.setState({failed: true});
		});
	},
	render : function(){
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
			<img className="img-responsive" src="/static/img/logo_3_500x100.png"/>
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
});

