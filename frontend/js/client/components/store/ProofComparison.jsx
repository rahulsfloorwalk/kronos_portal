import React, { Component } from "react";
import PropTypes from "prop-types";

import { fetchProofTagsByStore, getProofsByTag, fetchProofTagsByStoreAndQuestionnaireType } from "../../service/proof_tag.js";
import { fetchQuestionnaireTypesForProofComparison } from "../../service/questionnaire_type.js";

import AttachmentPreviewForProofComparison from "../audit_store/AttachmentPreviewForProofComparison.jsx";

import Jumbotron from "../../../components/Jumbotron.jsx";
import Loading from "../../../components/Loading.jsx";


class ShowAttachment extends Component {
	static propTypes = {
		audit_cycle_attachments: PropTypes.object.isRequired,
		audit_cycle_length: PropTypes.number
	};

	constructor(props){
		super(props);
	}

	render(){
		let attachment_list = [];
		let attachment_data;
		for(let attachment of this.props.audit_cycle_attachments.attachments){
			attachment_list.push(<AttachmentPreviewForProofComparison key={attachment.id} attachment={attachment} />);
		}
		if(attachment_list.length > 0){
			attachment_data = (
				<div className="col-xs-offset-1 col-xs-10">
					{attachment_list}
				</div>
			);
		}
		else{
			attachment_data = (<Jumbotron key="empty" heading="No proofs for this tag" para=""/>);
		}

		if(this.props.audit_cycle_length === 1){
			return (
				<div className="col-sm-12 col-md-12" style={{paddingLeft: "12px", paddingRight: "12px"}}>
					<center><h4>{this.props.audit_cycle_attachments.name}</h4></center>
					<div className="row" style={{maxHeight:"500px",overflow:"auto",padding:"5px"}}>
						{attachment_data}
					</div>
				</div>
			);
		}
		else if(this.props.audit_cycle_length === 2){
			return (
				<div className="col-sm-6 col-md-6" style={{paddingLeft: "12px", paddingRight: "15px",borderRight: "1px solid"}}>
					<center><h4>{this.props.audit_cycle_attachments.name}</h4></center>
					<div className="row" style={{maxHeight:"500px",overflow:"auto",padding:"5px"}}>
						{attachment_data}
					</div>
				</div>
			);
		}
		else{
			return (
				<div className="col-sm-4 col-md-4" style={{paddingLeft: "12px", paddingRight: "15px", borderRight: "1px solid"}}>
					<center><h4>{this.props.audit_cycle_attachments.name}</h4></center>
					<div className="row" style={{maxHeight:"500px",overflow:"auto",padding:"5px"}}>
						{attachment_data}
					</div>
				</div>
			);
		}
	}
}

export default class ProofComparison extends Component{
	static propTypes = {
		params: PropTypes.shape({
			storeId: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		questionnaireTypes: [],
		selectedQuestionnaireTypeId: undefined,
		proof_tags: [],
		audit_cycle_attachments: []
	};

	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};
	componentDidMount() {
		Promise.all([
			fetchProofTagsByStore(this.props.params.storeId),
			fetchQuestionnaireTypesForProofComparison(this.props.params.storeId),
		]).then(([proof_tags, questionnaireTypes]) => {
			const firstQT = questionnaireTypes[0] || {};

			this.setState({
				proof_tags,
				questionnaireTypes,
				selectedQuestionnaireTypeId: String(firstQT.id),
			});
		});
	}

	changeQuestionnaireType = (e) => {
		const questionnaire_type_id = e.target.value;
		fetchProofTagsByStoreAndQuestionnaireType(this.props.params.storeId, questionnaire_type_id).then((proof_tags) =>{
			this.setState({
				proof_tags,
				selectedQuestionnaireTypeId: questionnaire_type_id,
				audit_cycle_attachments: []
			});
		});
	};

	getProofs = (e) => {
		this.setLoading(true);
		getProofsByTag(this.props.params.storeId, this.state.selectedQuestionnaireTypeId, e.target.value).then((audit_cycle_attachments)=>{
			this.setState({
				audit_cycle_attachments
			});
			this.setLoading(false);
		});
	};

	render(){
		let questionnaire_select_box;
		let questionnaire_option_list = [];
		let option_tag_list = [];

		if(this.state.questionnaireTypes.length > 1){
			for(let qt of this.state.questionnaireTypes){
				questionnaire_option_list.push(<option key={qt.id} value={qt.id}>{qt.name}</option>);
			}
			questionnaire_select_box = (
				<select className="form-control form-control-sm" style={{width:"15%", float:"left", marginRight:"1%"}} onChange={this.changeQuestionnaireType}>
					{questionnaire_option_list}
				</select>
			);
		}

		for(let p of this.state.proof_tags){
			option_tag_list.push(<option key={p.id} value={p.id}>{p.proof_tag.name}</option>);
		}

		let loading_code;
		if(this.state.loading){
			loading_code = (<Loading/>);
		}
		else{
			loading_code = null;
		}

		let audit_cycle_list_data;
		let audit_cycle_attachment_show_list = [];
		if(this.state.audit_cycle_attachments.length > 0){
			for(let a of this.state.audit_cycle_attachments){
				audit_cycle_attachment_show_list.push(<ShowAttachment key={a.id} audit_cycle_attachments={a} audit_cycle_length={this.state.audit_cycle_attachments.length}/>);
			}
			audit_cycle_list_data = (
				<div className="row" style={{marginLeft: "-10px", marginRight: "-10px"}}>
					{audit_cycle_attachment_show_list}
				</div>
			);
		}
		else{
			audit_cycle_list_data = (<Jumbotron key="empty" heading="Please select tag for Audit Cycle Wise Comparison" para="You can see attachment comparison audit cycle wise for store."/>);
		}

		return (
			<div>
				<h4 className="page-header" style={{margin: "20px 0 10px"}}>
					{questionnaire_select_box}
					<select className="form-control form-control-sm" style={{width:"15%"}} onChange={this.getProofs}>
						<option value="" hidden>Select Tag</option>
						{option_tag_list}
					</select>
				</h4>
				{loading_code}
				{audit_cycle_list_data}
			</div>
		);
	}
}
