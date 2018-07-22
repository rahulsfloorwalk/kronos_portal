import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { } from "../../../styles.js";

import Section from "./Section.jsx";

import Jumbotron from "../../../components/Jumbotron.jsx";
import { Tasks } from "../../../components/Icons.jsx";
import { auditStorePropType } from "../../prop_types.js";

import { findAuditStore } from "../../reducers/audit_store.js";

export class __SectionList extends React.Component {
	static propTypes = {
		sections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			sequence: PropTypes.number.isRequired,
		})),
		auditStore: auditStorePropType.isRequired,
		showErrors: PropTypes.bool,
	};

	render(){
		const sectionRows = this.props.sections.map(section => {
			return <Section
				auditStoreId={this.props.auditStore.id}
				sectionId={section.id}
				key={section.id}
				showErrors={this.props.showErrors}/>;
		});
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please contact support"/>);
		}
		return (<div>
			<h3 className="page-header"><Tasks/> Questionnaire</h3>
			{sectionRows}
		</div>);
	}
}

const mapStateToProps = (store, ownProps) => {
	return {
		auditStore: findAuditStore( store, ownProps.auditStoreId),
		sections: store.sections,
	};
};

const SectionList = connect(mapStateToProps)(__SectionList);

SectionList.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
};

export default SectionList;
