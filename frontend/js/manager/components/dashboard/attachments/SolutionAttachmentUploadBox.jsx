import React from "react";
import PropTypes from "prop-types";
import { findAttachmentsBySolution, deleteAttachment,uploadFileForSolutions } from "../../../service/admin_dashboard.js";
import { Link } from "react-router";
import { Check, Warning, Paperclip, Cross  } from "../../../../components/Icons.jsx";
import ProgressBar from "../../../../components/ProgressBar.jsx";
import AttachmentProofIcon from "../../../../components/AttachmentProofIcon.jsx";

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

export default class SolutionAttachmentUploadBox extends React.Component {
	static propTypes = {
        params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
		}).isRequired,
       children: PropTypes.node,
    };
	state = {
		uploadMessage : "",
		attachments: [],
		inProgress: {},
		progress: "",
		expanded: false,
		uploading: false
	};

	toggleExpand = () => {
		this.setState({expanded: !this.state.expanded});
	};

	reloadState = () => {
		findAttachmentsBySolution(this.props.params.solutionId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount() {
		this.reloadState();
	}

	uploadButtonClicked = () => {
		this.uploadInput.click();
	};

	setProgressState = (tempId, progressState) => {
		this.setState((prevState)=>{
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	};

	uploadFile = () => {
		if( this.uploadInput.files.length > 10){
			alert("You can only upload 10 attachments at once");
			return;
		}
		for( let toUploadFile of this.uploadInput.files){
			let tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			var promise = uploadFileForSolutions(this.props.params.solutionId,toUploadFile);
			promise.progress((type, percent)=>{
				if(type === "INIT"){
					this.setProgressState(tempId, {
						uploadMessage :"initializing upload",
						active: false,
					});
				}
				if(type === "STARTING_UPLOAD"){
					this.setProgressState(tempId, {
						uploadMessage :"starting upload",
						active: true,
					});
				}
				if(type === "UPLOAD_PROGRESS"){
					this.setProgressState(tempId, {
						uploadMessage :"",
						progress: Math.floor(percent)
					});
				}
			});
			promise.always(()=>{
				this.setProgressState(tempId, {
					progress :"",
					uploading:false,
					active: false
				});
			});
			promise.then(()=>{
				this.setProgressState(tempId, {
					uploadMessage :"upload successful",
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
		deleteAttachment(attachment.id,this.props.params.solutionId).then(()=>{
			this.reloadState();
		});
	};

	render() {
		let uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default pull-right"><Paperclip/> Upload</button>);
		let deletable = true;

		var attachmentRows = [];
		for(let a of this.state.attachments){
			attachmentRows.push(<AttachmentItem attachment={a} deletable={deletable} onDelete={this.attachmentDeleteClicked} key={a.id}/>);
		}

		let panelClass = this.state.attachments.length > 0 ? "panel-success-hoverable" : "panel-default";
		let panelIcon = this.state.attachments.length > 0 ? <Check/> : <Warning/>;

		let toShow = this.state.expanded || this.state.attachments.length === 0;

		for(let id in this.state.inProgress){
			if(this.state.inProgress[id].uploading){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<div key={id} className="list-group-item">
					<div className="pull-right">
						{this.state.inProgress[id].uploadMessage}
					</div>
					{fileName}<br/>
					<ProgressBar percentage={this.state.inProgress[id].progress} striped={this.state.inProgress[id].active} active={this.state.inProgress[id].active}/>
				</div>);
			}
			if(this.state.inProgress[id].error){
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<div key={id} className="list-group-item list-group-item-danger">
					<div className="pull-right">
						<b>{this.state.inProgress[id].uploadMessage}</b>
					</div>
					{fileName}<br/>
				</div>);
			}
		}


		if( attachmentRows.length === 0){
			attachmentRows.push(
				<div key="empty" className="list-group-item text-center text-muted">
					<h4>
							Upload at least one ID Proof<br/>
						<small>only images or PDFs are supported</small>
					</h4>
				</div>
			);
		}

		return (
			<div className={"panel " + panelClass}>
				 <div style={{display:"flex",justifyContent:"flex-end",padding:"1rem"}}>
                     <Link to="/admindashboard/solution">   <Cross/></Link>
                    </div>
				<div className="panel-heading" style={{cursor:"pointer"}} onClick={this.toggleExpand}>
					<input type="file" multiple
						onChange={this.uploadFile}
						disabled={this.state.uploading}
						ref={(input)=>this.uploadInput = input}
						style={{"display":"none"}}/>
					{uploadButton}
					<h4>
						{panelIcon} ID Proofs(<span className="text-danger"><b>*</b></span>)
					</h4>
				</div>
				{ toShow ?
					<div className="list-group" style={{"height":"150px", "overflowY":"auto"}}>
						{attachmentRows}
					</div>
					: null }
			</div>
		);
	}
}