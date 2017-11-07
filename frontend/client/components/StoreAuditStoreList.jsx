import React, { Component } from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { fetchAuditStoresByStore } from '../service/audit_store.js';

import { File } from '../../js/components/Icons.jsx';
import { getColor } from '../../js/utils.js';
import AuditTypeLabel from '../../js/components/AuditTypeLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';
import Loading from '../../js/components/Loading.jsx';

export default class StoreAuditStoreList extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			auditStores: []
		};
	}
	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	}
	componentDidMount() {
		this.setLoading(true);
		fetchAuditStoresByStore(this.props.params.storeId).then((auditStores) => {
			this.setState({ auditStores });
		}).always(()=>this.setLoading(false));
	}
	render(){
		if(this.state.loading){
			return <Loading/>;
		}

		let prevAC;
		let rows = this.state.auditStores.map((as) => {
			let ac_name = prevAC === as.audit.audit_cycle.id ? "": as.audit.audit_cycle.name;
			let ac_type = prevAC === as.audit.audit_cycle.id ? "": <AuditTypeLabel auditType={as.audit.audit_cycle.type}/>;
			prevAC = as.audit.audit_cycle.id;
			return (
			<tr key={as.id}>
				<td><big><b>{ac_name}</b></big></td>
				<td>{ac_type}</td>
				<td className={"text-right "+getColor(as.color)}>{moment(as.audit_date).format(momentDateFormat)}</td>
				<td className={"text-right "+getColor(as.color)}>{as.percentage}%</td>
				<td className={"text-right "+getColor(as.color)}><Link to={`/audit_store/${as.id}`} className="btn btn-sm btn-default">View</Link></td>
			</tr>);
		});
		if(rows.length > 0){
			return (
				<div>
					<table className="table table-hover table-striped table-condensed">
						<thead>
							<tr>
								<th>Audit Cycle</th>
								<th>Type</th>
								<th className="text-right">Audit Date</th>
								<th className="text-right">Score</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="no reports for this store" para="only completed reports will show up here"/>);
		}
	}
}
