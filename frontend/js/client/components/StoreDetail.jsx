import React from 'react';
import { Link } from 'react-router';

import { fetchStore } from '../service/store.js';

import { File, Stats } from '../../components/Icons.jsx';
import Panel from '../../components/Panel.jsx';
import Loading from '../../components/Loading.jsx';
import NavLink from '../../components/NavLink.jsx';

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
								{ this.state.store.code ? <td className="">Code</td> : null }
								<td className="">Name</td>
								{ this.state.store.type ? <td className="">Type</td> : null }
								{ this.state.store.priority ? <td className="">Priority</td> : null }
								<td className="">Address</td>
								<td className="">City</td>
							</tr>
							<tr>
								{ this.state.store.code ? <td><b>{ this.state.store.code }</b></td> : null }
								<td><b>{ this.state.store.name }</b></td>
								{ this.state.store.type ? <td><b>{ this.state.store.type }</b></td> : null }
								{ this.state.store.priority ? <td><b>{ this.state.store.priority }</b></td> : null }
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
