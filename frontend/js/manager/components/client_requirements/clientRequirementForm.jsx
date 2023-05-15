import React, { Component } from "react";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import Alert from "react-s-alert";
import { getAuditOptions, getAuditStatus, getAuditCategory, getQuestionnaireType } from "../../../utils.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormTextarea from "../../../components/FormTextarea.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import { auditCategoryList, clientRequirementQuestionaryList } from "../../../constants.js";
import Select from "react-select";
import { Check, Warning, Paperclip } from "../../../components/Icons.jsx";
import { pointerStyle } from "../../../styles.js";
import { findAttachmentsByUser, uploadFileForUser, deleteAttachment } from "../../../auditor/service/attachment.js";
import AttachmentProofIcon from "../../../components/AttachmentProofIcon.jsx";
import ProgressBar from "../../../components/ProgressBar.jsx";

class AttachmentItem extends React.Component {
	static propTypes = {
		attachment: PropTypes.shape({
			proof_type: PropTypes.string.isRequired,
			direct_url: PropTypes.string.isRequired,
			file_name: PropTypes.string.isRequired,
		}),
		deletable: PropTypes.bool.isRequired,
		onDelete: PropTypes.func.isRequired,
	};

	static defaultProps = {
		deletable: false,
		onDelete: () => {},
		attachment: {}
	};

	render() {
		let icon = <AttachmentProofIcon proofType={this.props.attachment.proof_type}/>;
		if(this.props.deletable){
			var deleteButton = <button onClick={()=>this.props.onDelete(this.props.attachment)}
				className="btn btn-default btn-sm pull-right"
				title="Delete Attachment"><Cross/>
			</button>;
		}
		return (
			<div className="list-group-item">
				{deleteButton}
				<big>{icon} <a href={this.props.attachment.direct_url} target="_blank" rel="noopener noreferrer" title="Click to download file">
					{this.props.attachment.file_name}
				</a></big>
			</div>
		);
	}
}


const FieldErrors = PropTypes.arrayOf(PropTypes.string);

export default class ClientRequirementForm extends Component {
    static propTypes = {
        params: PropTypes.shape({
            clientId: PropTypes.string,
            clientRequirementId: PropTypes.string,
        }).isRequired,
    }

    state = {
        errors: {},

        start_date: "",
        end_date: "",
        problem_statement: "",
        type: "",
        category: [],
        qtype: [],
        number_of_audit: 0,
        set_up_fees: 0,
        price_per_audit: 0,
        execution_budget: 0,
        scope_of_work: "",
        audit_flow: "",
        project_manager_email: "",
        sales_representative_email: "",
        uploadMessage: "",
        attachments: [],
        inProgress: {},
        progress: "",
        expanded: false,
        uploading: false
    }

    toggleExpand = () => {
        this.setState({ expanded: !this.state.expanded });
    };
    // reloadState = () => {
    // 	findAttachmentsByUser().then((attachments) => {
    // 		this.setState({
    // 			attachments
    // 		});
    // 	});
    // };

    // componentDidMount() {
    // 	this.reloadState();
    // }

    uploadButtonClicked = () => {
        this.uploadInput.click();
    };

    setProgressState = (tempId, progressState) => {
        this.setState((prevState) => {
            return Object.assign({}, prevState, {
                inProgress: Object.assign({}, prevState.inProgress, {
                    [tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
                })
            });
        });
    };

    uploadFile = () => {
        if (this.uploadInput.files.length > 10) {
            alert("You can only upload 10 attachments at once");
            return;
        }
        for (let toUploadFile of this.uploadInput.files) {
            let tempId = Math.random().toString(36).substring(7);
            this.setProgressState(tempId, {
                uploading: true,
                file: toUploadFile
            });
            var promise = uploadFileForUser(toUploadFile);
            promise.progress((type, percent) => {
                if (type === "INIT") {
                    this.setProgressState(tempId, {
                        uploadMessage: "initializing upload",
                        active: false,
                    });
                }
                if (type === "STARTING_UPLOAD") {
                    this.setProgressState(tempId, {
                        uploadMessage: "starting upload",
                        active: true,
                    });
                }
                if (type === "UPLOAD_PROGRESS") {
                    this.setProgressState(tempId, {
                        uploadMessage: "",
                        progress: Math.floor(percent)
                    });
                }
            });
            promise.always(() => {
                this.setProgressState(tempId, {
                    progress: "",
                    uploading: false,
                    active: false
                });
            });
            promise.then(() => {
                this.setProgressState(tempId, {
                    uploadMessage: "upload successful",
                });
                this.reloadState();
            }, (errorMessage) => {
                this.setProgressState(tempId, {
                    uploadMessage: errorMessage,
                    error: true,
                });
            });
        }
    };

    attachmentDeleteClicked = (attachment) => {
        deleteAttachment(attachment.id).then(() => {
            this.reloadState();
        });
    };
   
    //-------------------------------------------------------------------------------------------------------------------

    fieldChanged = (e) => {
        affectInputEventToComponent(e, this);
    };

    selectHandleChange = (selected_value, field_name) => {
        let selected_list = selected_value.map(val => val.value);
        this.setState((prevState) => {
            return Object.assign({}, prevState, {
                [field_name]: selected_list,
                [field_name + "_list"]: selected_value
            });
        });
    };

    dateChanged = (name, date) => {
        if (typeof date !== "string") {
            this.setState({
                [name]: date.format("YYYY-MM-DD")
            });
        }
    };

    startDateChanged = (date) => {
        this.dateChanged("start_date", date);
    };

    endDateChanged = (date) => {
        this.dateChanged("end_date", date);
    };

    render() {
        const categoryOptions = [];
        const questionaryOptions = [];

        for (let option of auditCategoryList) {
            categoryOptions.push({
                label: getAuditCategory(option),
                value: option
            });
        }
        for (let option of clientRequirementQuestionaryList) {
            questionaryOptions.push({
                label: getQuestionnaireType(option),
                value: option
            });
        }

        // ------------------------------------------------------------------------------------

        let uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default pull-right"><Paperclip /> Upload</button>);
        let deletable = true;
        var attachmentRows = [];
        for (let a of this.state.attachments) {
            attachmentRows.push(<AttachmentItem attachment={a} deletable={deletable} onDelete={this.attachmentDeleteClicked} key={a.id} />);
        }

        let panelClass = this.state.attachments.length > 0 ? "panel-success-hoverable" : "panel-default";
        let panelIcon = this.state.attachments.length > 0 ? <Check /> : <Warning />;

        let toShow = this.state.expanded || this.state.attachments.length === 0;

        for (let id in this.state.inProgress) {
            if (this.state.inProgress[id].uploading) {
                let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
                attachmentRows.push(<div key={id} className="list-group-item">
                    <div className="pull-right">
                        {this.state.inProgress[id].uploadMessage}
                    </div>
                    {fileName}<br />
                    <ProgressBar percentage={this.state.inProgress[id].progress} striped={this.state.inProgress[id].active} active={this.state.inProgress[id].active} />
                </div>);
            }
            if (this.state.inProgress[id].error) {
                let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
                attachmentRows.push(<div key={id} className="list-group-item list-group-item-danger">
                    <div className="pull-right">
                        <b>{this.state.inProgress[id].uploadMessage}</b>
                    </div>
                    {fileName}<br />
                </div>);
            }
        }


        if (attachmentRows.length === 0) {
            attachmentRows.push(
                <div key="empty" className="list-group-item text-center text-muted">
                    <h4>
                        Upload Your Attachments here<br />
                    </h4>
                </div>
            );
        }



        var modalTitle = this.props.params.auditCycleId ? "Edit Client Requirement" : "Add Client Requirement";

        return (
            <Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
                <form onSubmit={this.onSubmit}>
                    <FormErrorList errors={this.state.errors.non_field_errors} />
                    <FormDateInput label="Start Date" name="start_date" onChange={this.startDateChanged} value={this.state.start_date} />
                    <FormDateInput label="End Date" name="end_date" onChange={this.endDateChanged} value={this.state.end_date} />
                    <FormInput label="Problem Statement:" type="text" name="problem_statement" value={this.state.problem_statement} onChange={this.fieldChanged} />

                    <FormSelect label="Audit Type" name="type" onChange={this.fieldChanged} value={this.state.type}>
                        <option value=""></option>
                        <option value="MYSTERY_AUDIT">{getAuditOptions("MYSTERY_AUDIT")}</option>
                        <option value="REVEALED_AUDIT">{getAuditOptions("REVEALED_AUDIT")}</option>
                        <option value="MYSTERY_REVEALED">{getAuditOptions("MYSTERY_REVEALED")}</option>
                    </FormSelect>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Audit Category:</label>
                        <Select
                            name="category"
                            value={this.state.category ? categoryOptions.filter(obj => this.state.category.includes(obj.value) === true) : null}
                            onChange={(e) => this.selectHandleChange(e, "category")}
                            options={categoryOptions}
                            isMulti={true} />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>Questionnaire Type:</label>
                        <Select
                            name="qtype"
                            value={this.state.qtype ? questionaryOptions.filter(obj => this.state.qtype.includes(obj.value) === true) : null}
                            onChange={(e) => this.selectHandleChange(e, "qtype")}
                            options={questionaryOptions}
                            isMulti={true} />
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput label="Number of Audits:" type="number" name="number_of_audit" onChange={this.fieldChanged} value={this.state.number_of_audit} />
                        </div>
                        <div className="col-md-6">
                            <FormSelect label="Audit Type" name="type" onChange={this.fieldChanged} value={this.state.type}>
                                <option value=""></option>
                                <option value="MYSTERY_AUDIT">{getAuditOptions("MYSTERY_AUDIT")}</option>
                                <option value="REVEALED_AUDIT">{getAuditOptions("REVEALED_AUDIT")}</option>
                                <option value="MYSTERY_REVEALED">{getAuditOptions("MYSTERY_REVEALED")}</option>
                            </FormSelect>
                        </div>
                    </div>
                    <FormInput label="Price Per Audit: (₹)" type="number" name="price_per_audit" onChange={this.fieldChanged} value={this.state.price_per_audit} />
                    <FormInput label="Setup Fees: (₹)" type="number" name="set_up_fees" onChange={this.fieldChanged} value={this.state.set_up_fees} />
                    <FormInput label="Execution Budget: (₹)" type="number" name="execution_budget" onChange={this.fieldChanged} value={this.state.execution_budget} />
                    <FormTextarea label="Scope of Work:" name="scope_of_work" onChange={this.fieldChanged} value={this.state.scope_of_work} />
                    <FormTextarea label="Audit Flow:" name="audit_flow" onChange={this.fieldChanged} value={this.state.audit_flow} />
                    <FormInput label="Email Address of Project Manager:" type="email" name="project_manager_email" onChange={this.fieldChanged} value={this.state.project_manager_email} />
                    <FormInput label="Email Address of Sales Representative:" type="email" name="sales_representative_email" onChange={this.fieldChanged} value={this.state.sales_representative_email} />

                    {/* -------------------------------------------------------------------------------------------------------------------------- */}

                    <div className={"panel " + panelClass}>
                        <div className="panel-heading" style={pointerStyle} onClick={this.toggleExpand}>
                            <input type="file" multiple
                                onChange={this.uploadFile}
                                disabled={this.state.uploading}
                                ref={(input) => this.uploadInput = input}
                                style={{ "display": "none" }} />
                            {uploadButton}
                            <h4>
                                {panelIcon} Attachments: (<span className="text-danger"><b>*</b></span>)
                            </h4>
                        </div>
                        {toShow ?
                            <div className="list-group" style={{ "height": "150px", "overflowY": "auto" }}>
                                {attachmentRows}
                            </div>
                            : null}
                    </div>
{/*************************************************************************************************************** */}

                    {/* <div className={"panel " + panelClass} onClick={this.toggleExpand}>
                        <h4>
                            {panelIcon} Attachments: (<span className="text-danger"><b>*</b></span>)
                        </h4>

                        <div className="panel-heading" style={pointerStyle}>
                            <input type="file"
                                name="file"
                                multiple
                                // onChange={this.handleFileChange}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.xlsx,.csv"
                            />
                        </div>

                    </div> */}
                    <SaveButton />
                </form>
            </Modal>


        );
    }
}

