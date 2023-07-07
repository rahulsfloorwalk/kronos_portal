import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import $ from "jquery";
import { affectInputEventToComponent } from "../../../../react_utils.js";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import { findProofTag } from "../../../service/proof_tag.js";

class DashProofsTags extends React.Component{
	static propTypes = {
		// dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			proof_tags: [],
			errMsg: ""
		};
	}

	componentDidMount() {
		// this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		// fetchproofTag(this.props.params.auditCycleId).then( (proof_tag) => {
		// 	this.setState({
		// 		proof_tag: proof_tag
		// 	});
		// });
		findProofTag().then((proof_tags) => {
			this.setState({
				proof_tags
			});
		});
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		let proof_tag_list = [];
		$(".row input:checked").each(function() {
			let val = $(this).attr("value");
			proof_tag_list.push(val);
		});
		// saveproofTag(this.props.params.auditCycleId, proof_tag_list).then((AuditCycle) => {
		// 	hashHistory.push(`/audit_cycle/${AuditCycle.id}/questionnaire`);
		// 	Alert.success("Proofs Tag Saved");
		// },(err) => {
		// 	this.setState({
		// 		errMsg : err.responseJSON.non_field_errors[0],
		// 	});
		// });
	};

	render(){
		var span_style = {
			color:"red",
			padding:"2px"
		};
		var proof_tag = this.state.proof_tags;
		var proof_tag_rows = [];
		for (let i in proof_tag){
			if(proof_tag[i]["is_present_in_audit_cycle"]){
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
			<Modal modalTitle={"Proofs Tag"} size="modal-lg" onClose={hashHistory.goBack}>
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


export default DashProofsTags;
