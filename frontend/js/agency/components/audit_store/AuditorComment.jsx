import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { setAuditorComment } from "../../actions/report_section.js";

export class __AuditorComment extends React.Component {
	static propTypes = {
		auditorComment: PropTypes.string,
		editable: PropTypes.bool.isRequired,
		saving: PropTypes.bool,
		onCommentChanged: PropTypes.func.isRequired,
	};

	static defaultProps = {
		editable: false,
		auditorComment: "",
	};

	state = {
		auditorComment: "",
		pristine: true,
	};

	componentDidMount(){
		this.setState({
			auditorComment: this.props.auditorComment,
		});
	}

	componentWillReceiveProps(nextProps){
		if( this.state.pristine){
			this.setState({
				auditorComment: nextProps.auditorComment,
			});
		}
	}

	inputChanged = (e) => {
		this.setState({
			auditorComment: e.target.value,
			pristine: false,
		});
	};

	commentChanged = () => {
		this.setState({
			pristine: true,
		});
		if( this.props.auditorComment !== this.state.auditorComment){
			this.props.onCommentChanged(this.state.auditorComment);
		}
	};

	render(){
		return (<div>
			<p><b>Section Summary:</b> { this.props.saving ? <span className="text-warning">&nbsp;&nbsp;&nbsp;saving...</span> : null}</p>
			{this.props.editable ?
				<input
					className="form-control"
					name="auditorComment"
					value={this.state.auditorComment}
					onBlur={this.commentChanged}
					onChange={this.inputChanged}
					placeholder="type out your relevant experience here in a few sentences"
				/>
				:
				<p>{this.state.auditorComment}</p>
			}
		</div>);
	}
}

const findReportSection = (store, auditStoreId, sectionId) => {
	return store.reportSections.find((rs) => rs.audit_store_id === auditStoreId && rs.section_id === sectionId);
};

const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const mapStoreToProps = (store, ownProps) => {
	const reportSection = findReportSection(store, ownProps.auditStoreId, ownProps.sectionId);
	const auditStore = findAuditStore(store, ownProps.auditStoreId);
	return {
		auditorComment: reportSection && reportSection.auditor_comment,
		editable: auditStore && auditStore.is_editable_by_agency,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onCommentChanged: (auditorComment) => {
			dispatch(setAuditorComment(ownProps.auditStoreId, ownProps.sectionId, auditorComment));
		},
	};
};

const AuditorComment = connect(mapStoreToProps, mapDispatchToProps)(__AuditorComment);

AuditorComment.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
	sectionId: PropTypes.number.isRequired,
};

export default AuditorComment;
