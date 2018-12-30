import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { } from "../../components/Icons.jsx";

import { pointerStyle }  from "../../styles.js";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";
import { getColor } from "../../utils.js";

import { filterSelectors, loadingSelectors } from "../selectors";
import apiNames from "../api_names";

export class AuditStoreTable extends Component {
	static propTypes = {
		reports: PropTypes.arrayOf(PropTypes.shape({
			sections: PropTypes.arrayOf(PropTypes.shape({
			})),
		})).isRequired,
		isLoading: PropTypes.bool,
	};

	constructor(props){
		super(props);
	}

	render(){
		if(this.props.reports.length === 0) {
			if(this.props.isLoading){
				return (<Loading/>);
			} else {
				return (<Jumbotron heading="there are no audits here" para="try changing audit cycle"/>);
			}
		}

		let headers = [];
		headers.push(<th key="store_code">Store Code</th>);
		headers.push(<th key="store_name">Name</th>);
		headers.push(<th key="date" className="text-right">Date</th>);
		headers.push(<th key="total_score">Total Score</th>);
		headers = headers.concat(this.props.reports[0].sections.filter(s => s.max_marks > 0).map(s => <th key={s.sequence} className="text-right">{s.section}</th>));

		const trs = [];
		let previousStore;
		this.props.reports.forEach( r => {
			let tds = [];
			let storeName = previousStore === r.store_id ? "" : r.store_name;
			let cityName = previousStore === r.store_id ? "" : r.city_name;
			let storeCode = previousStore === r.store_id ? "" : r.store_code;
			let tdStyle = {};
			if(previousStore === r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid White 0px";
			}
			if(previousStore !== r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid lightgray 2px";
			}
			for(let s of r.sections){
				if(s.max_marks > 0){
					tds.push(<td key={s.sequence} className={getColor(s.color) + " text-right"} style={tdStyle}>{s.percentage === null ? "N/A" : s.percentage+"%" }</td>);
				}
			}
			trs.push(
				<tr key={r.audit_store_id} style={pointerStyle} onClick={()=> hashHistory.push(`/audit_store/${r.audit_store_id}`)}>
					<td className="">{storeCode}</td>
					<td style={tdStyle}>
						<b>{storeName}</b><br/>
						<small>{cityName}</small>
					</td>
					<td className="text-right" style={tdStyle}>{moment(r.audit_date).format(momentDateFormat)}</td>
					<td className={getColor(r.total_score.color) + " text-right"} style={tdStyle}>{r.total_score.percentage === null ? "N/A" : r.total_score.percentage+"%" }</td>
					{tds}
				</tr>
			);
			previousStore = r.store_id;
		});
		return (
			<table className="table table-bordered table-hover table-responsive">
				<thead>
					<tr>{headers}</tr>
				</thead>
				<tbody>
					{trs}
				</tbody>
			</table>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		reports: filterSelectors.filterReports(state),
		isLoading: loadingSelectors.isLoading(state, apiNames.report.findByAuditCycleId),
	};
};

export default connect(mapStateToProps, {})(AuditStoreTable);
