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
			sectionId: PropTypes.string.isRequired,
			auditCycleId: PropTypes.string.isRequired,
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
		let required_proof_tag_list = [];
		$(".row input:checkbox[name=proof_list]:checked").each(function() {
			let val = $(this).attr("value");
			proof_tag_list.push(val);
		});

		$(".row input:checkbox[name=required_proof]:checked").each(function() {
			let val = $(this).attr("value");
			required_proof_tag_list.push(val);
		});

		saveSectionProofTag(this.props.params.sectionId, this.props.params.auditCycleId, proof_tag_list, required_proof_tag_list).then(() => {
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
		let vertical_line_style = {
			borderRight: "solid 1px #80808082",
			height:"30px"
		};
		let checkbox_label_style = {
			fontSize:"14px",
			margin:"0px",
			padding: "5px 5px"
		};
		let checkbox_style = {
			verticalAlign:"middle",
			width:"20px",
			height:"20px"
		};
		let div_style = {
			display: "flex",
			alignItems:"center",
			border: "solid 1px #80808082",
			padding: "1px",
			borderRadius: "5px",
			marginBottom: "10px"
		};
		var proof_tag = this.state.proof_tag;
		var proof_tag_rows = [];
		for (let i in proof_tag){
			if(proof_tag[i]["is_present_in_section"]){
				let is_proof_required = proof_tag[i]["is_required"];
				proof_tag_rows.push(
					<div className="col-sm-6 col-md-4" key={i}>
						<div style={div_style}>
							<input type="checkbox" title="Required proof" name="required_proof" value={proof_tag[i]["id"]} defaultChecked={is_proof_required} className="checkbox-bg-danger"/>
							<span style={vertical_line_style}></span>
							<label style={checkbox_label_style}>
								<input type="checkbox" name="proof_list" value={proof_tag[i]["id"]} defaultChecked style={checkbox_style} />
								<span> {proof_tag[i]["name"]}</span>
							</label>
						</div>
					</div>
				);
			}
			else{
				proof_tag_rows.push(
					<div className="col-sm-6 col-md-4" key={i}>
						<div style={div_style}>
							<input type="checkbox" name="required_proof" value={proof_tag[i]["id"]} className="checkbox-bg-danger" />
							<span style={vertical_line_style}></span>
							<label style={checkbox_label_style}>
								<input type="checkbox" name="proof_list" value={proof_tag[i]["id"]} style={checkbox_style} />
								<span> {proof_tag[i]["name"]}</span>
							</label>
						</div>
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
