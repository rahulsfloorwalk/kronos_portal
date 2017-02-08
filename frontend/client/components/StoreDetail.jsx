import React from 'react';
import { Link } from 'react-router';

import { fetchStore } from '../service/store.js';

import { Pencil } from '../../js/components/Icons.jsx';
import Panel from '../../js/components/Panel.jsx';
import Loading from '../../js/components/Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		fetchStore(this.props.params.storeId).then((store) => {
			this.setState({
				store
			});
		});
	},
	render: function(){
		if(! this.state.store){
			return <Loading/>;
		}
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/store">Stores</Link></li>
					<li className="active">{this.state.store.name}</li>
				</ol>
				<h2 className="page-header">
					{ this.state.store.name }
				</h2>
				<div className="row">
				<div className="col-md-6">
				<Panel title="Store Info" noBody={true}>
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Name</td><td><b>{ this.state.store.name }</b></td></tr>
							<tr><td className="text-right">Address</td><td><b>{ this.state.store.address }</b></td></tr>
							<tr><td className="text-right">Location</td><td><b>{ this.state.store.location.name }</b></td></tr>
							<tr><td className="text-right">City</td><td><b>{ this.state.store.location.city.name }</b></td></tr>
						</tbody>
					</table>
				</Panel>
				</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});

