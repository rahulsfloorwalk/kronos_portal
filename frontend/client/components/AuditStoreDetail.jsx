import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, url}  from '../../config.js';

import { fetchAuditStore } from '../service/audit_store.js';
import { fetchSections } from '../service/section.js';
import { fetchReportSections } from '../service/report_section.js';

import { File, Print, Download } from '../../js/components/Icons.jsx';
import Loading from '../../js/components/Loading.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';

import SectionList from './SectionList.jsx';
import SectionTotalsBox from './SectionTotalsBox.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../js/utils.js';

export default React.createClass({
	getInitialState: function(){
		return {
			auditStore: null,
			sections: [],
			reportSections: [],
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

		return (
			<div>
				<ol className="breadcrumb hidden-print">
					<li><Link to="/store">Stores</Link></li>
					<li><Link to={`/store/${this.state.auditStore.audit.store.id}/audit_store`}>{this.state.auditStore.audit.store.name}</Link></li>
					<li className="active">Audit: <b>{moment(this.state.auditStore.audit_date).format(momentDateFormat)}</b></li>
				</ol>
				<h2 className="page-header">
					<button className="btn btn-default pull-right hidden-print" onClick={window.print}>
						<Print/> Print Report
					</button>
					<a className="btn btn-default pull-right" href={url.api_base_path + 'client/audit_store/' + this.state.auditStore.id + '/xlsx_report'}>
					<Download/> Download as xlsx
					</a>
					<File/> Audit Report
				</h2>
				<div className="row">
				<div className="col-md-6">
					<div className="panel panel-primary">
						<div className="panel-heading">
							<h4 className="panel-title"><File/> Audit Report</h4>
						</div>
						<table className="table table-striped">
							<tbody>
								<tr>
									<td className="text-right">Name:</td>
									<th>{this.state.auditStore.audit.store.name}</th>
								</tr>
								<tr>
									<td className="text-right">Type:</td>
									<th>{getAuditType(this.state.auditStore.audit.audit_cycle.type)}</th>
								</tr>
								<tr>
									<td className="text-right">Location:</td>
									<th>{`${this.state.auditStore.audit.store.location.name}, ${this.state.auditStore.audit.store.location.city.name}`}</th>
								</tr>
								<tr>
									<td className="text-right">Audit Date:</td>
									<th>{moment(this.state.auditStore.audit_date).format(momentDateFormat)}</th>
								</tr>
								<tr>
									<td className="text-right">Total Score:</td>
									<th>{this.state.auditStore.percentage} %</th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="col-md-6">
					<SectionTotalsBox sections={this.state.sections} reportSections={this.state.reportSections}/>
				</div>
				</div>
				<SectionList auditStoreId={this.props.params.auditStoreId} sections={this.state.sections} reportSections={this.state.reportSections}/>
			</div>
		);
	},
});
