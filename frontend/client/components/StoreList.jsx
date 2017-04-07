import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import Jumbotron from '../../js/components/Jumbotron.jsx';
import { getColor } from '../../js/utils.js';
import { ChevronRight, ChevronDown, ShareAlt } from '../../js/components/Icons.jsx';

import { fetchStoresByAuditCycleAndCity } from '../service/store.js';
import { fetchAuditStoreByAuditCycleAndStore } from '../service/audit_store.js';

var StoreRow = React.createClass({
	getInitialState: function(){
		return {
			expanded: false,
			auditStores: []
		};
	},
	toggleExpandClicked: function(){
		if(! this.state.expanded && ! this.state.loading){
			this.setState({
				expanded: true,
				loading: true
			});
			fetchAuditStoreByAuditCycleAndStore(this.props.auditCycleId, this.props.store.store_id).then( (auditStores) => {
				this.setState({
					auditStores,
				});
			}).always( () => {
				this.setState({
					loading: false
				});
			});
		} else {
			this.setState({
				expanded: false,
			});
		}
	},
	render: function(){
		let buttonText = <ChevronRight/>;
		var tbodyStyle = {};
		var percentStyle = {};

		var auditStoreTrs = [];
		if(this.state.expanded){

			tbodyStyle = {
				"border": "solid gray 3px",
			};
			percentStyle = {
				"fontWeight": "bold"
			};

			buttonText = <ChevronDown/>;
			for( let as of this.state.auditStores){
				let innerSections = [];
				for(let s of as.sections){
					if(s.max_marks !== 0){
						innerSections.push(<td key={s.sequence} className={getColor(s.color) + " text-right"}>
							{s.percentage}%
						</td>);
					}
				}
				auditStoreTrs.push(<tr key={as.audit_store_id} onClick={()=> hashHistory.push(`/audit_store/${as.audit_store_id}`)} style={{cursor:'pointer'}} title="Click to view report">
					<td className="text-right">
						<b>{moment(as.audit_date).format(momentDateFormat)}</b>
					</td>
					<td></td>
					{innerSections}
				</tr>);
			}
		}

		let sections = [];
		for(let s of this.props.store.sections){
			if(s.max_marks !== 0){
				sections.push(<td key={s.sequence} className={getColor(s.color) + " text-right"} style={percentStyle}>{s.percentage}%</td>);
			}
		}

		return (
			<tbody style={tbodyStyle}>
			<tr onClick={this.toggleExpandClicked} style={{cursor:'pointer'}} title="Click to Expand view">
				<td>
					<b>{this.props.store.store_name}</b><br/>
					<small>{this.props.store.address}</small><br/>
					<small>{this.props.store.location}</small>
				</td>
				<td className="text-right">{this.props.store.audit_store_count}</td>
				{sections}
			</tr>
			{auditStoreTrs}
			</tbody>
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
			storeRows.push(<StoreRow auditCycleId={this.props.auditCycleId} store={this.state.stores[id]} key={id}/>);
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
				<table className="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th>Stores in {this.props.cityName}</th>
							<th>No. of Reports</th>
							{sections}
						</tr>
					</thead>
					{storeRows}
				</table>
			);
		} else {
			storeTable = (<Jumbotron heading="there are no audits here" para="try changing audit cycle or city"/>);
		}
		return storeTable;
	},
});

