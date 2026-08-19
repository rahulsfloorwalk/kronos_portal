import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

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
				proof_tag: proof_tag.map((obj) => ({
					id: obj.id,
					name: obj.name,
					is_present_in_section: obj.is_present_in_section,
					is_required: obj.is_required,
					is_comment_required: obj.is_comment_required,
					hide_from_client: obj.hide_from_client,
					max_attachment_count: obj.max_attachment_count || 2,
				})).sort((a, b) => b.is_present_in_section - a.is_present_in_section)
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
		let proof_tag_list = this.state.proof_tag.filter((obj) => obj.is_present_in_section);

		saveSectionProofTag(this.props.params.sectionId, this.props.params.auditCycleId, proof_tag_list).then(() => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			Alert.success("Section Proofs Tag Saved");
		},(err) => {
			this.setState({
				errMsg : err.responseJSON.non_field_errors[0],
			});
		});
	};

	onRequiredCheck = (e, proof_id) => {
		let proof_tag_list = [];
		for(let i of this.state.proof_tag){
			let proof = i;
			if (i.id == proof_id){
				proof["is_required"] = e.target.checked;
			}
			proof_tag_list.push(i);
		}
		this.setState({
			proof_tag: proof_tag_list,
		});
	};

	onCheck = (e, proof_id) => {
		let proof_tag_list = [];
		for(let i of this.state.proof_tag){
			let proof = i;
			if (i.id == proof_id){
				proof["is_present_in_section"] = e.target.checked;
			}
			proof_tag_list.push(i);
		}
		this.setState({
			proof_tag: proof_tag_list,
		});
	};

	onMaxAttachmentChange = (e, proof_id) => {
		let value = e.target.value;
		if(value && parseInt(value) >= 2){
			let proof_tag_list = [];
			for(let i of this.state.proof_tag){
				let proof = i;
				if (i.id == proof_id){
					proof["max_attachment_count"] = parseInt(value);
				}
				proof_tag_list.push(i);
			}
			this.setState({
				proof_tag: proof_tag_list,
			});
		}
	};

	onCommentRequiredCheck = (e, proof_id) => {
		let proof_tag_list = [];
		for(let i of this.state.proof_tag){
			let proof = i;
			if (i.id == proof_id){
				proof["is_comment_required"] = e.target.checked;
			}
			proof_tag_list.push(i);
		}
		this.setState({
			proof_tag: proof_tag_list,
		});
	};

	onHideFromClientCheck = (e, proof_id) => {
		let proof_tag_list = [];
		for(let i of this.state.proof_tag){
			let proof = i;
			if (i.id == proof_id){
				proof["hide_from_client"] = e.target.checked;
			}
			proof_tag_list.push(i);
		}
		this.setState({
			proof_tag: proof_tag_list,
		});
	};
	render() {
		var span_style = {
			color:"red",
			padding:"2px"
		};
		var checkbox_style = {
			verticalAlign:"middle",
			width:"20px",
			height:"20px"
		};
		var proof_tag = this.state.proof_tag;
		let proof_tag_selected = [];

		for (let i in proof_tag){
			let is_present_in_section = proof_tag[i].is_present_in_section;
			let is_required = proof_tag[i].is_required;
			let is_comment_required = proof_tag[i].is_comment_required;
			let hide_from_client = proof_tag[i].hide_from_client;
			let id = proof_tag[i].id;
			let name = proof_tag[i].name;
			let max_attachment_count = proof_tag[i].max_attachment_count;
			proof_tag_selected.push(
				<tr key={id}>
					<td><input type="checkbox" name="proof_list" value={id} defaultChecked={is_present_in_section} style={checkbox_style} onChange={(e) => this.onCheck(e, id)} /></td>
					<td><input type="checkbox" name="required_proof" value={id} style={checkbox_style} defaultChecked={is_required} disabled={!is_present_in_section} onChange={(e) => this.onRequiredCheck(e, id)} /></td>
					<td><input type="checkbox" name="is_comment_required" value={id} style={checkbox_style} defaultChecked={is_comment_required} disabled={!is_present_in_section} onChange={(e) => this.onCommentRequiredCheck(e, id)} /></td>
					<td><input type="checkbox" name="hide_from_client" value={id} style={checkbox_style} defaultChecked={hide_from_client} disabled={!is_present_in_section} onChange={(e) => this.onHideFromClientCheck(e, id)} /></td>
					<td><input type="number" className="form-control" value={max_attachment_count} min={2} max={10} style={{width: "100px"}} disabled={!is_present_in_section} onChange={(e) => this.onMaxAttachmentChange(e, id)} /></td>
					<td>{name}</td>
				</tr>
			);
		}
		return (
			<Modal modalTitle={`Proof Tag for ${this.state.name} Section`} size="modal-lg" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="" style={{paddingBottom:"3%"}}>
						<div className="table-responsive">
							<table className="table table-striped">
								<thead>
									<tr>
										<th>Select proof</th>
										<th>Is mandatory?</th>
										<th>Comment Required</th>
										<th>Hide from Client</th>
										<th>Max attachment for proof</th>
										<th>Proof tag name</th>
									</tr>
								</thead>
								<tbody>
									{proof_tag_selected}
								</tbody>
							</table>
						</div>
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
