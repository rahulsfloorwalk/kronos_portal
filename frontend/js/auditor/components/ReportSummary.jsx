import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
import { connect } from "react-redux";
import { Tasks } from "../../components/Icons.jsx";
import { submitReportSummary } from "../actions/audit_store.js";
import "../../../css/bs_overrides.scss";
// import { ClientID } from "../../constants.js";
class __ReportSummary extends Component {

	static propTypes = {
		report_summary: PropTypes.string.isRequired,
		audit_store_id: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		dispatch: PropTypes.func.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props){
		super(props);
		this.state = {
			report_summary: this.props.report_summary || "",
		};
	}

	componentDidMount(){
		this.setState({ report_summary: this.props.report_summary, });
	}

	componentWillReceiveProps(nextProps){
		this.setState({ report_summary: nextProps.report_summary, });
	}

	summaryChanged = (e) => {
		this.setState({
			report_summary: e.target.value,
		});
	};

	onBlur = (e) => {
		this.summaryChanged(e);
		this.props.dispatch(submitReportSummary(this.props.audit_store_id, e.target.value));
		Alert.success("Data Saved");
	};

	render(){
		if(this.props.editable){
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary</h3>
					<textarea rows="5" className="form-control" value={this.state.report_summary} onChange={this.summaryChanged} onBlur={this.onBlur}/>
				</div>
			);
		} else {
			const summaryText = this.props.report_summary ? <span className="summary_text"> {this.props.report_summary}</span> : null;
			return (
				<div>
					<h3 className="page-header"><Tasks/> Report Summary</h3>
					{summaryText}
				</div>
			);
		}
	}
}

export default connect()(__ReportSummary);