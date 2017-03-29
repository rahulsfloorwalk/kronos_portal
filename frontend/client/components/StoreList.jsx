import React from 'react';
import { Link } from 'react-router';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import { getColor } from '../../js/utils.js';

import { fetchStoresByAuditCycleAndCity } from '../service/store.js';

var StoreRow = React.createClass({
	render: function(){
		let sections = [];
		for(let s of this.props.store.sections){
			if(s.max_marks !== 0){
				sections.push(<td key={s.sequence} className={getColor(s.color)}>{s.percentage}%</td>);
			}
		}
		return (
			<tr>
				<td>
					<b>{this.props.store.store_name}</b><br/>
					{this.props.store.address}<br/>
					{this.props.store.location}
				</td>
				<td>{this.props.store.audit_store_count}</td>
				{sections}
				<td>
					<Link to={`/store/${this.props.store.id}/audit_store`} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			stores: [],
		};
	},
	componentDidMount: function() {
		fetchStoresByAuditCycleAndCity(this.props.auditCycleId, this.props.cityId).then((stores)=>{
			this.setState({
				stores
			});
		});
	},
	componentWillReceiveProps: function(nextProps){
		this.setState({
			stores: [],
		});
		if(nextProps.auditCycleId && nextProps.cityId){
			fetchStoresByAuditCycleAndCity(nextProps.auditCycleId, nextProps.cityId).then((stores)=>{
				this.setState({
					stores
				});
			});
		}
	},
	render: function(){
		var storeRows = [];
		for(let id in this.state.stores) {
			storeRows.push(<StoreRow store={this.state.stores[id]} key={id}/>);
		}

		var storeTable;
		if( storeRows.length > 0) {
			let sections = [];
			for(let s of this.state.stores[0].sections){
				if(s.max_marks !== 0){
					sections.push(<th key={s.sequence}>{s.section}</th>);
				}
			}
			storeTable = (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Stores in {this.props.cityName}</th>
							<th>No. of Reports</th>
							{sections}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{storeRows}
					</tbody>
				</table>
			);
		} else {
			storeTable = (<Jumbotron heading="there are no audits here" para="try changing audit cycle or city"/>);
		}
		return storeTable;
	},
});

