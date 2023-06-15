import React, { Component } from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { Tasks } from "../../components/Icons.jsx";
import { setReportSummary } from "../actions/audit_store.js";
import { findSummaryByAuditStoreId } from "../selectors/audit_store";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";

// import { ClientID } from "../../constants.js";

class __ReportSummary extends Component {

	static propTypes = {
		reportSummary: PropTypes.string.isRequired,
		auditStoreId: PropTypes.number.isRequired,
		onBlur: PropTypes.func.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props){
		super(props);
		this.state = {
			reportSummary: this.props.reportSummary,
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
		this.props.onBlur(this.props.auditStoreId, e.target.value);
	};

	render(){
		if(this.props.editable){
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary111</h3>
					{/* <GrammarlyEditorPlugin clientId={ClientID}> */}
					<textarea rows="5" className="form-control" value={this.state.reportSummary} onChange={this.summaryChanged} onBlur={this.onBlur}/>
					{/* </GrammarlyEditorPlugin> */}
				</div>
			);
		} else {
			const summaryText = this.state.reportSummary ? <span> {this.state.reportSummary}</span> : null;
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary</h3>
					{summaryText}
				</div>
			);
		}
	}
}

var mapStoreToProps = function(store, ownProps){
	const reportSummary = findSummaryByAuditStoreId(store, ownProps.auditStoreId);
	return {
		reportSummary,
	};
};

export default connect(mapStoreToProps, {
	onBlur: setReportSummary,
})(__ReportSummary);