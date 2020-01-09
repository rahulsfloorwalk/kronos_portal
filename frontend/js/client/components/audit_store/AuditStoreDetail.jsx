import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { url }  from "../../../../config.js";

import { fetchAuditStore } from "../../service/audit_store.js";
import { fetchSections } from "../../service/section.js";
import { fetchReportSections } from "../../service/report_section.js";
import { findImpactFactorsByAuditStore } from "../../service/impact_factor";

import { File, Print, Download } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import AuditStoreDetailsBox from "./AuditStoreDetailsBox.jsx";
import SectionList from "./SectionList.jsx";
import SectionTotalsBox from "./SectionTotalsBox.jsx";
import AttachmentPrintRenderer from "./AttachmentPrintRenderer.jsx";
import OverallExperienceGauge from "./OverallExperienceGauge.jsx";
import ImpactFactorBox from "./ImpactFactorBox.jsx";

import floorwalkLogoUrl from "../../../../img/logo_500x300.png";
import { fetchUser } from "../../service/user.js";

export default class AuditStoreDetail extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		printMode: PropTypes.bool,
		route: PropTypes.shape({
			printMode: PropTypes.bool,
		}),
		location:PropTypes.object
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
		fetchUser().then((clientUser)=>{
			this.setState({
				clientUser
			});
			if( this.props.location.pathname === "/"){
				hashHistory.push("/dashboard");
			}
		});
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
		findImpactFactorsByAuditStore(this.props.params.auditStoreId).then((impactFactors) => {
			this.setState({
				impactFactors
			});
		});
	}

	render() {
		if(! this.state.auditStore){
			return <Loading/>;
		}
		const printMode = this.props.printMode || this.props.route.printMode || false;
		
		let imgUrl = this.state.clientUser && this.state.clientUser.client && this.state.clientUser.client.logo_url ?  this.state.clientUser.client.logo_url : floorwalkLogoUrl;
		
		return (
			
			<div>
				<h2 className="page-header">
					{ printMode ?
						<button className="btn btn-default pull-right hidden-print" onClick={window.print}>
							<Print/> Print Report
						</button>
						:
						<a className="btn btn-default pull-right hidden-print" href={`report_print.html#/${this.props.params.auditStoreId}`} target="_blank" rel="noopener noreferrer">
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
						{ printMode ?
						<div className="watermark">
							<img src={imgUrl} height="250" width="300" />
						</div>
						:
						null
						}
						<AuditStoreDetailsBox auditStore={this.state.auditStore}/>
					</div>
					<div className="col-md-6">
						<OverallExperienceGauge colorCode={this.state.auditStore.color} value={this.state.auditStore.percentage}/>
					</div>
				</div>
				{ this.state.impactFactors && this.state.impactFactors.length > 0 ?
					<ImpactFactorBox impactFactors={this.state.impactFactors}/> : null
				}
				<SectionTotalsBox sections={this.state.sections} reportSections={this.state.reportSections}/>
				<SectionList auditStoreId={parseInt(this.props.params.auditStoreId)} sections={this.state.sections} reportSections={this.state.reportSections} printMode={printMode}/>
				{ printMode ?
					<AttachmentPrintRenderer auditStoreId={parseInt(this.props.params.auditStoreId)} sections={this.state.sections}/>
					: null }
			</div>
			
		);
	}
}
