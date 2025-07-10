import React, { Component } from "react";
import PropTypes from "prop-types";

import { Tasks } from "../../components/Icons.jsx";
import { backToOriginalReportSummary,reWriteReportSummary,setReportSummary } from "../service/audit_store.js";
import "../../../css/bs_overrides.scss";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";

// import { ClientID } from "../../constants.js";
export default class ReportSummary extends Component {

	static propTypes = {
		reportSummary: PropTypes.string.isRequired,
		auditStoreId: PropTypes.number.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props){
		super(props);
		this.state = {
			reportSummary: this.props.reportSummary,
			oldReportSummary : "",
		};
	}

	componentDidMount(){
		this.setState({ reportSummary: this.props.reportSummary, });
	}

	componentWillReceiveProps(nextProps){
		if(this.props.reportSummary != nextProps.reportSummary) {
			this.setState({reportSummary: nextProps.reportSummary,});
		}
	}

	summaryChanged = (e) => {
		this.setState({
			reportSummary: e.target.value,
		});
	};

	onBlur = (e) => {
		this.summaryChanged(e);
		setReportSummary(this.props.auditStoreId, e.target.value);
	};

	reWriteSummary = () => {
		reWriteReportSummary(this.props.auditStoreId, this.state.reportSummary)
			.then((response) => {
				this.setState({
					reportSummary: response.report_summary ,
					oldReportSummary : response.report_summary_old,
				});
			});
	};
	backToOriginal = () => {
		backToOriginalReportSummary(this.props.auditStoreId, this.state.oldReportSummary)
			.then((response) => {
				this.setState({ reportSummary: response.report_summary });
			});
	};

	render(){
		if(this.props.editable){
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary <button className="btn btn-default" onClick={this.reWriteSummary}>Rewrite</button> <button className="btn btn-default" onClick={this.backToOriginal}>Back to Original</button></h3>
					<textarea rows="5" className="form-control" value={this.state.reportSummary} onChange={this.summaryChanged} onBlur={this.onBlur}/>
				</div>
			);
		} else {
			const summaryText = this.state.reportSummary ? <span className="summary_text"> {this.state.reportSummary}</span> : null;
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary</h3>
					{summaryText}
				</div>
			);
		}
	}
}

