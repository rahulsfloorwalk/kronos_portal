import React from "react";
import PropTypes from "prop-types";

import Jumbotron from "../../../components/Jumbotron.jsx";
import { Paperclip, Tasks } from "../../../components/Icons.jsx";

import AttachmentDisplayBox from "./AttachmentDisplayBox.jsx";
import Section from "./Section.jsx";

import { fetchAnswers } from "../../service/answer.js";

export default class SectionList extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number,
		sections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			max_marks: PropTypes.number,
			sequence: PropTypes.number,
			name: PropTypes.string,
			questions: PropTypes.arrayOf(PropTypes.shape({
			})),
		})),
		reportSections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			auditor_comment: PropTypes.string,
			pm_comment: PropTypes.string,
			not_applicable: PropTypes.bool,
			color_code: PropTypes.number,
			marks_obtained: PropTypes.number,
			max_marks: PropTypes.number,
		})),
		printMode: PropTypes.bool,
		children: PropTypes.node,
	};

	static defaultProps = {
		printMode: false,
	};

	state = {
		answers: []
	};

	componentDidMount() {
		fetchAnswers(this.props.auditStoreId).then((answers) => {
			this.setState({
				answers
			});
		});
	}

	render() {
		var sectionRows = [];
		for(var s of this.props.sections) {
			let reportSection = this.props.reportSections.filter((rs) => rs.section === s.id)[0];
			sectionRows.push(<Section auditStoreId={this.props.auditStoreId} section={s} answers={this.state.answers} reportSection={reportSection} key={s.id} printMode={this.props.printMode}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="contact site administrator"/>);
		}
		return (
			<div>
				{ this.props.printMode ? null
					:
					<div>
						<h3 className="page-header">
							<Paperclip/> Attachments
						</h3>
						<AttachmentDisplayBox auditStoreId={this.props.auditStoreId} printMode={this.props.printMode}/>
					</div>
				}
				<h3 className="page-header">
					<Tasks/> Questionnaire
				</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	}
}

