import React from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import { url }  from "../../../../config.js";

import { fetchAuditStore } from "../../service/audit_store.js";
import { fetchSections } from "../../service/section.js";
import { fetchReportSections } from "../../service/report_section.js";

import { File, Print, Download } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import AuditStoreDetailsBox from "./AuditStoreDetailsBox.jsx";
import SectionList from "../SectionList.jsx";
import SectionTotalsBox from "./SectionTotalsBox.jsx";

export default class AuditStoreDetail extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		printMode: PropTypes.bool,
		route: PropTypes.shape({
			printMode: PropTypes.bool,
		}),
	};

	static defaultProps = {
		printMode: false,
		route: {
			printMode: false,
		},
	};

	state = {
		auditStore: null,
		sections: [],
		reportSections: [],
	};

	componentDidMount() {
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
	}

	render() {
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
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + "client/audit_store/" + this.state.auditStore.id + "/ears_report"}>
						<Download/> E.A.R.S Report
					</a> : ""}
					{ ! printMode ? <a className="btn btn-default pull-right hidden-print" href={url.api_base_path + "client/audit_store/" + this.state.auditStore.id + "/xlsx_report"}>
						<Download/> Excel Report
					</a> : ""}
					<File/> Audit Report
				</h2>
				<div className="row">
					<div className="col-md-6">
						<AuditStoreDetailsBox auditStore={this.state.auditStore}/>
					</div>
					<div className="col-md-6">
						<SectionTotalsBox sections={this.state.sections} reportSections={this.state.reportSections}/>
					</div>
				</div>
				<SectionList auditStoreId={this.props.params.auditStoreId} sections={this.state.sections} reportSections={this.state.reportSections} printMode={printMode}/>
			</div>
		);
	}
}
