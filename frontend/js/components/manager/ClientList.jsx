import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Loading from '../Loading.jsx';
import { Plus, King } from '../Icons.jsx';

import { fetchClients } from '../../manager/service/client.js';

var ClientRow = React.createClass({
	render: function(){
		var linkTo = `/client/${this.props.client.id}/audit_cycle`;
		let style = {
			height: "250px",
		};
		let logoUrl = this.props.client.logo_url ? this.props.client.logo_url : `https://dummyimage.com/250x250/efefef/000000.png&text=${this.props.client.name}`;
		return (
			<div className="col-md-3">
				<div className="panel panel-default" style={style}>
				<div className="panel-body text-center">
				<h4>{this.props.client.name}</h4>
				<Link to={linkTo} className="">
				<img style={{"padding":"10px", "maxHeight":"200px", "maxWidth":"100%"}} className="" src={logoUrl}/>
				</Link>
				</div>
				</div>
			</div>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchClients().done((clients)=>this.setState({clients}));
	},
	render: function(){
		if(! this.state.clients){
			return <Loading/>;
		}

		let rows = [];
		for(let c of this.state.clients) {
			rows.push(<ClientRow client={c} key={c.id}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					<Link to="/client/add" className="btn btn-default pull-right"><Plus/> Add Client</Link>
					<King/> Client List
				</h2>
				<div className="row">
				{rows}
				</div>
				{this.props.children}
			</div>
		);
	},
});
