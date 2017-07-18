import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Plus, King } from '../Icons.jsx'
import { fetchClients } from '../../manager/actions/client.js'

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

var ClientList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchClients());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.clients) {
			rows.push(<ClientRow client={this.props.clients[id]} key={id}/>);
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

var mapStoreToProps = function(store){
	return {
		clients: store.clients
	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientList); 
