import React from 'react';
import { Link } from 'react-router';

import { fetchStore } from '../service/store.js';

import { File, Stats } from '../../js/components/Icons.jsx';
import Panel from '../../js/components/Panel.jsx';
import Loading from '../../js/components/Loading.jsx';
import NavLink from '../../js/components/NavLink.jsx';

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
			{/*<h2 className="page-header"> { this.state.store.name } </h2>*/}
				<div className="row">
				<div className="col-md-12">
				<div className="panel panel-default">
					<table className="table table-striped table-bordered">
						<tbody>
							<tr>
								<td className="">Code</td>
								<td className="">Name</td>
								<td className="">Type</td>
								<td className="">Priority</td>
								<td className="">Address</td>
								<td className="">City</td>
							</tr>
							<tr>
								<td><b>{ this.state.store.code }</b></td>
								<td><b>{ this.state.store.name }</b></td>
								<td><b>{ this.state.store.type }</b></td>
								<td><b>{ this.state.store.priority }</b></td>
								<td><b>{ this.state.store.address }</b></td>
								<td><b>{ this.state.store.city.name }</b></td>
							</tr>
						</tbody>
					</table>
				</div>
				</div>
				</div>
				<ul className="nav nav-tabs">
					<NavLink to={`/store/${this.props.params.storeId}/trends`}><Stats/> Trends</NavLink>
					<NavLink to={`/store/${this.props.params.storeId}/reports`}><File/> Reports</NavLink>
				</ul>
				{this.props.children}
			</div>
		);
	},
});

