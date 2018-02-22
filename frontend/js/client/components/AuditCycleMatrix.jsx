import React from 'react';
import { Link, hashHistory } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchLatestAuditCycleMatrix } from '../service/dashboard.js';

import { File } from '../../components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../../components/LabelValue.jsx';
import AuditStoreStatusLabel from '../../components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../components/Jumbotron.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			report: {
				headings: [],
				rows: [[]]
			}
		};
	},
	reloadData: function(auditType){
		fetchLatestAuditCycleMatrix(auditType).then((report) => {
			this.setState({
				report
			});
		});
	},
	componentDidMount: function() {
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps) {
		this.reloadData(nextProps.auditType);
	},
	render: function(){
		let trs = [];
		for(let row of this.state.report.rows) {
			let tds = [];
			for( let i in row){
				if( parseInt(i) === 0){
					//tds.push(<td className="text-right" key={ row[0] + "-" + i }>{row[i]}</td>);
				} else if( parseInt(i) === 3){
					tds.push(<td className="text-right" key={ row[0] + "-" + i }>{moment(row[i]).format(momentDateFormat)}</td>);
				} else {
					var classes = "";
					if( parseFloat(row[i]) <= parseFloat(this.state.report.section_max_marks[i-1]) / 4){
						classes = "danger";
					} else if( parseFloat(row[i]) <= parseFloat(this.state.report.section_max_marks[i-1]) / 2){
						classes = "warning";
					} else if( parseFloat(row[i]) <= parseFloat(this.state.report.section_max_marks[i-1]) * 3/4){
						classes = "info";
					} else if( parseFloat(row[i]) <= parseFloat(this.state.report.section_max_marks[i-1])){
						classes = "success";
					}

					let cell = row[i];
					if( parseInt(i) === row.length - 1){
						cell += "%";
					}
					tds.push(<td className={"text-right " + classes} key={ row[0] + "-" + i }>{cell}</td>);
				} 
			}
			trs.push(<tr key={"row-"+row[0]} 
					title="Click to view report"
					style={{"cursor":"pointer"}}
					onClick={()=>hashHistory.push(`audit_store/${row[0]}`)}
				>{tds}</tr>);
		}
		var headings = [];
		for(var h of this.state.report.headings) {
			headings.push(<th key={h}>{h}</th>);
		}
		var headings2 = [];
		for(var i in this.state.report.section_max_marks) {
			headings2.push(<th className="text-right" key={"m"+i}>{this.state.report.section_max_marks[i]}</th>);
		}
		if(trs.length > 0){
			return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">
							<File/> Latest Audit Cycle: ( {getAuditType(this.state.report.type)})
						</h4>
					</div>
					<table className="table table-bordered table-hover">
						<thead>
							<tr>
								{headings}
							</tr>
						</thead>
						<tbody>
							{trs}
						</tbody>
						<tfoot>
							<tr>
								{headings2}
							</tr>
						</tfoot>
					</table>
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="no audits yet" para="latest audits will show up here"/>);
		}
	},
});

