import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../../config.js';

import { fetchAuditStore } from '../service/audit_store.js';
import { fetchSections } from '../service/section.js';
import { fetchReportSections } from '../service/report_section.js';

import { File, Print, Download } from '../../components/Icons.jsx';
import Loading from '../../components/Loading.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';

import SectionList from './SectionList.jsx';
import SectionTotalsBox from './SectionTotalsBox.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

export default React.createClass({
	getInitialState: function(){
		return {
			auditStore: null,
			sections: [],
			reportSections: [],
		};
	},
	getDefaultProps: function(){
		return {
			printMode: false,
		};
	},
	componentDidMount: function(){
		fetchAuditStore(this.props.params.auditStoreId).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
		fetchSections(this.props.params.auditStoreId).then((sections) => {
			this.setState({
				sections
			});
		});
		fetchReportSections(this.props.params.auditStoreId).then((reportSections) => {
			this.setState({
				reportSections
			});
		});
	},
	render: function(){
		if(! this.state.auditStore){
			return <Loading/>;
		}
		let printMode = this.props.printMode || this.props.route.printMode || false;

		return (
			<div>
				<h2 className="page-header">
					{ printMode ? 
						<button className="btn btn-default pull-right hidden-print" onClick={window.print}>
							<Print/> Print Report
						</button>
					 : 
						<a className="btn btn-default pull-right hidden-print" href={`report_print.html#/${this.props.params.auditStoreId}`} target="_blank">
							<Print/> Print Report
						</a>
					}
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + 'client/audit_store/' + this.state.auditStore.id + '/ears_report'}>
					<Download/> E.A.R.S Report
					</a> : ""}
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + 'client/audit_store/' + this.state.auditStore.id + '/xlsx_report'}>
					<Download/> Excel Report
					</a> : ""}
					<File/> Audit Report
				</h2>
				<div className="row">
				<div className="col-md-6">
					<div className="panel panel-primary">
						<div className="panel-heading">
							<h4 className="panel-title"><File/> Audit Details</h4>
						</div>
						<table className="table table-striped">
							<tbody>
								<tr>
									<td className="text-right">Client:</td>
									<th>{this.state.auditStore.audit.store.client.name}</th>
								</tr>
								{ this.state.auditStore.audit.store.code ?
									<tr>
										<td className="text-right">Store Code:</td>
										<th>{this.state.auditStore.audit.store.code}</th>
									</tr>
									: null }
								<tr>
									<td className="text-right">Store:</td>
									<th>{this.state.auditStore.audit.store.name}</th>
								</tr>
								<tr>
									<td className="text-right">Store Type:</td>
									<th>{this.state.auditStore.audit.store.type}</th>
								</tr>
								{ this.state.auditStore.audit.store.priority ?
									<tr>
										<td className="text-right">Store Priority:</td>
										<th>{this.state.auditStore.audit.store.priority}</th>
									</tr>
									: null }
								<tr>
									<td className="text-right">Audit Type:</td>
									<th>{getAuditType(this.state.auditStore.audit.audit_cycle.type)}</th>
								</tr>
								<tr>
									<td className="text-right">Address:</td>
									<th>{`${this.state.auditStore.audit.store.address}, ${this.state.auditStore.audit.store.city.name}`}</th>
								</tr>
								<tr>
									<td className="text-right">Audit Date:</td>
									<th>{moment(this.state.auditStore.audit_date).format(momentDateFormat)}</th>
								</tr>
								<tr>
									<td className="text-right">Total Score:</td>
									<th>
						<div className="progress">
							<div className={"progress-bar"} role="progressbar" aria-valuenow={this.state.auditStore.percentage} aria-valuemin="0" aria-valuemax="100" style={{width: this.state.auditStore.percentage + "%"}}>
							{this.state.auditStore.percentage}%
							</div>
						</div>
									</th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="col-md-6">
					<SectionTotalsBox sections={this.state.sections} reportSections={this.state.reportSections}/>
				</div>
				</div>
				<SectionList auditStoreId={this.props.params.auditStoreId} sections={this.state.sections} reportSections={this.state.reportSections} printMode={printMode}/>
			</div>
		);
	},
});
