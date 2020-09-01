import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import $ from "jquery";

import Alert from "react-s-alert";

import { affectInputEventToComponent } from "../../../react_utils.js";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import { findSectionBySectionId } from "../../selectors/section";
import { fetchSectionProofTag, saveSectionProofTag } from "../../actions/section_proof_tag.js";
import { findFormErrors } from "../../selectors/forms";
import { sectionPropType } from "./prop_types";

export class SectionProofTag extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			sectionId: PropTypes.number.isRequired,
			auditCycleId: PropTypes.number.isRequired,
		}),

		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,

		section: sectionPropType,
		errors: PropTypes.object,
	};

	state = {
		section: {},
		proof_tag: {},
		errMsg: ""
	};

	componentDidMount() {
		if(this.props.section){
			this.setState({
				section: this.props.section
			});
		}
		fetchSectionProofTag(this.props.params.sectionId).then( (proof_tag) => {
			this.setState({
				proof_tag: proof_tag
			});
		});
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.section !== this.props.section){
			this.setState(nextProps.section);
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		let proof_tag_list = [];
		$(".row input:checked").each(function() {
			let val = $(this).attr("value");
			proof_tag_list.push(val);
		});

		saveSectionProofTag(this.props.params.sectionId, this.props.params.auditCycleId, proof_tag_list).then(() => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			Alert.success("Section Proofs Tag Saved");
		},(err) => {
			this.setState({
				errMsg : err.responseJSON.non_field_errors[0],
			});
		});
	};

	render() {
		var span_style = {
			color:"red",
			padding:"2px"
		};
		var proof_tag = this.state.proof_tag;
		var proof_tag_rows = [];
		for (let i in proof_tag){
			if(proof_tag[i]["is_present_in_section"]){
				proof_tag_rows.push(
					<div className="col-sm-6 col-md-4" key={i}>
						<label style={{fontSize:"14px",marginBottom:"10px"}}><input type="checkbox" value={proof_tag[i]["id"]} defaultChecked style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {proof_tag[i]["name"]}</span></label>
					</div>
				);
			}
			else{
				proof_tag_rows.push(
					<div className="col-sm-6 col-md-4" key={i}>
						<label style={{fontSize:"14px",marginBottom:"10px"}}><input type="checkbox" value={proof_tag[i]["id"]} style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {proof_tag[i]["name"]}</span></label>
					</div>
				);
			}
		}
		return (
			<Modal modalTitle={`Proof Tag for ${this.state.name} Section`} size="modal-lg" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row" style={{paddingBottom:"3%"}}>
						{proof_tag_rows}
					</div>
					<SaveButton/> &nbsp; <span style={span_style}><b>{this.state.errMsg}</b></span>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const sectionId = parseInt(ownProps.params.sectionId);
	const auditCycleId = parseInt(ownProps.params.auditCycleId);
	return {
		sectionId,
		auditCycleId,
		section: findSectionBySectionId(store, sectionId),
		errors: findFormErrors(store),
	};
};

export default ReactRedux.connect( mapStoreToProps)(SectionProofTag);
