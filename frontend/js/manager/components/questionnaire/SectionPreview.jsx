import React from "react";
import PropTypes from "prop-types";

import { getQuestionType } from "../../../utils.js";
import ImpactFactorTags from "../../../components/ImpactFactorTags.jsx";
import MarkdownViewer from "../../../../js/components/MarkdownViewer.jsx";
import { hashHistory } from "react-router";

import Modal from "../../../components/Modal.jsx";
import { url } from "../../../../config.js";

export default class SectionPreview extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		sections: [],
		loading: false,
		error: null,
	};

	componentDidMount() {
		this.fetchPreviewData();
	}

	fetchPreviewData = () => {
		const { auditCycleId } = this.props.params;
		this.setState({ loading: true, error: null });

		fetch(url.api_base_path + "manager/audit_cycle/" + auditCycleId + "/questionnaire/preview")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to fetch preview data");
				}
				return res.json();
			})
			.then((data) => {
				this.setState({ sections: data, loading: false });
			})
			.catch((err) => {
				this.setState({ error: err.message, loading: false });
			});
	};

	renderOptions = (q) => {
		if (
			(q.question_type === "MUTEX" || q.question_type === "MULTISELECT") &&
			q.question_data &&
			q.question_data.options &&
			q.question_data.options.length > 0
		) {
			return q.question_data.options
				.map((o) => o.value + " (" + o.marks + " " + (o.marks === 1 ? "mark" : "marks") + ")")
				.join(" / ");
		}
		return <span className="text-muted">—</span>;
	};

	renderQuestionRows = (questions) => {
		if (!questions || questions.length === 0) {
			return (
				<tr>
					<td colSpan="6" className="text-center text-muted">
						no questions here
					</td>
				</tr>
			);
		}

		return questions.map((q) => (
			<tr key={q.id}>
				<td>{q.sequence}</td>
				<td>
					<div className="pull-right">
						<ImpactFactorTags
							impactFactors={q.question_data && q.question_data.impact_factors}
						/>
					</div>
					<MarkdownViewer markdown={q.question_txt || ""} />
				</td>
				<td>{q.question_note ? q.question_note : "---"}</td>
				<td>{q.is_required ? "Yes" : "No"}</td>
				<td>{this.renderOptions(q)}</td>
				<td>{q.optional_comment_required ? "Yes" : "No"}</td>
				<td>{getQuestionType(q.question_type)}</td>
				<td>{q.max_marks}</td>
			</tr>
		));
	};

	renderSection = (section) => {
		return (
			<div className="panel panel-default" key={section.id} style={{ marginBottom: "5rem" }}>
				<div className="panel-heading" style={{ backgroundColor: "#d0d0d0", borderColor: "#b0b0b0" }}>
					<span className="pull-right">
						{section.minimum_attachment_count > 0 ? (
							<span>
								<b>{section.minimum_attachment_count}</b> attachments,&nbsp;
							</span>
						) : null}
						<b>{section.questions.length}</b> questions,&nbsp;
						<b>{section.max_marks}</b> marks
					</span>
					<h4 className="panel-title">
						{section.sequence} - <b>{section.name}</b>
					</h4>
				</div>
				<div className="table-responsive">
					<table className="table table-striped">
						<colgroup>
							<col style={{ width: "5%" }} />
							<col style={{ width: "45%" }} />
							<col style={{ width: "20%" }} />
							<col style={{ width: "10%" }} />
							<col style={{ width: "10%" }} />
							<col style={{ width: "10%" }} />
						</colgroup>
						<thead>
							<tr>
								<th>#</th>
								<th>Question</th>
								<th>Question Note</th>
								<th>Question Required</th>
								<th>Options</th>
								<th>Comment Required</th>
								<th>Question Type</th>
								<th>Max. Marks</th>
							</tr>
						</thead>
						<tbody>
							{this.renderQuestionRows(section.questions)}
							<tr>
								<td colSpan="6">
									<b>Proof Tags: </b>
									{section.proof_tags && section.proof_tags.length > 0
										? section.proof_tags.map((tag) => tag.name).join(", ")
										: <span className="text-muted">none</span>
									}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	render() {
		const { sections, loading, error } = this.state;

		const totalMarks = sections.reduce((acc, s) => acc + (s.max_marks || 0), 0);

		return (
			<Modal modalTitle="" onClose={hashHistory.goBack} size="modal-lg" dialogStyle={{ width: "90%", maxWidth: "1200px" }}>
				<div>
					<h3>
						Questionnaire Preview
						{!loading && sections.length > 0 && (
							<small style={{ marginLeft: "10px" }}>({totalMarks} Marks)</small>
						)}
					</h3>

					{loading && (
						<div className="text-center text-muted" style={{ padding: "40px 0" }}>
							Loading preview...
						</div>
					)}

					{error && (
						<div className="alert alert-danger">{error}</div>
					)}

					{!loading && !error && sections.length === 0 && (
						<div className="jumbotron text-center">
							<h3>This questionnaire is empty</h3>
							<p>No sections have been added yet.</p>
						</div>
					)}

					{!loading && !error && sections.map((section) => this.renderSection(section))}
				</div>
			</Modal>
		);
	}
}