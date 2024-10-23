
import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
import { connect } from "react-redux";
import { Tasks } from "../../components/Icons.jsx";
import { submitNpsSection } from "../actions/audit_store.js";
import "../../../css/bs_overrides.scss";
// import { ClientID } from "../../constants.js";
class __NpsSection extends Component {

	static propTypes = {
		nps_section: PropTypes.string.isRequired,
		audit_store_id: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		showErrors: PropTypes.bool.isRequired,
		dispatch: PropTypes.func.isRequired,
		editable: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		editable: false,
	};

	constructor(props) {
		super(props);
		this.state = {
			nps_section: this.props.nps_section || "",
			understanding_rating: null,
		};
	}

	componentDidMount() {
		this.setState({ nps_section: this.props.nps_section, });
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({ nps_section: nextProps.nps_section, });
	// }

	componentDidUpdate(prevProps) {
		if (prevProps.nps_section !== this.props.nps_section) {
			this.setState({ nps_section: this.props.nps_section });
		}
	}

	npssectionChanged = (e) => {
		this.setState({
			nps_section: e.target.value,
		});
	};

	onBlur = (e) => {
		this.npssectionChanged(e);
		this.props.dispatch(submitNpsSection(this.props.audit_store_id, e.target.value));
		Alert.success("Data Saved");
	};

	understandingRatingSelected = (nps_section_rating) => {
		// this.setState({nps_section_rating});
		this.setState({ understanding_rating: nps_section_rating });
		this.props.dispatch(submitNpsSection(this.props.audit_store_id, nps_section_rating));
		Alert.success("Rating Submitted");
	};

	render() {

		if (this.props.editable) {
			return (
				<div>
					<h3 className="page-header"><Tasks />Overall Experience</h3> {" "}
					<form onSubmit={this.onSubmit}>
						<div className="form-group">
							<label className="control-label">How would you rate your overall experience?</label>
							<div className="row">
								<div className="col-md-10">
									<div className="star-rating star-rating-lg">
										<input type="radio" id="understanding_10-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(10)} checked={this.state.understanding_rating === 10} />
										<label htmlFor="understanding_10-stars" className="star" title="10">&#9733;</label>

										<input type="radio" id="understanding_9-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(9)} checked={this.state.understanding_rating === 9} />
										<label htmlFor="understanding_9-stars" className="star" title="9">&#9733;</label>

										<input type="radio" id="understanding_8-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(8)} checked={this.state.understanding_rating === 8} />
										<label htmlFor="understanding_8-stars" className="star" title="8">&#9733;</label>

										<input type="radio" id="understanding_7-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(7)} checked={this.state.understanding_rating === 7} />
										<label htmlFor="understanding_7-stars" className="star" title="7">&#9733;</label>

										<input type="radio" id="understanding_6-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(6)} checked={this.state.understanding_rating === 6} />
										<label htmlFor="understanding_6-stars" className="star" title="6">&#9733;</label>

										<input type="radio" id="understanding_5-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(5)} checked={this.state.understanding_rating === 5} />
										<label htmlFor="understanding_5-stars" className="star" title="5">&#9733;</label>

										<input type="radio" id="understanding_4-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(4)} checked={this.state.understanding_rating === 4} />
										<label htmlFor="understanding_4-stars" className="star" title="4">&#9733;</label>

										<input type="radio" id="understanding_3-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(3)} checked={this.state.understanding_rating === 3} />
										<label htmlFor="understanding_3-stars" className="star" title="3">&#9733;</label>

										<input type="radio" id="understanding_2-stars" name="understanding_rating" onChange={() => this.understandingRatingSelected(2)} checked={this.state.understanding_rating === 2} />
										<label htmlFor="understanding_2-stars" className="star" title="2">&#9733;</label>

										<input type="radio" id="understanding_1-star" name="understanding_rating" onChange={() => this.understandingRatingSelected(1)} checked={this.state.understanding_rating === 1} />
										<label htmlFor="understanding_1-star" className="star" title="1">&#9733;</label>
									</div>
								</div>
							</div>

						</div>
					</form>
				</div>
			);
		} else {
			// const npssectionText = this.props.nps_section ? <span className="nps_section_text"> {this.props.nps_section}</span> : null;
			// return (
			// 	<div>
			// 		<h3 className="page-header"><Tasks /> NPS Section</h3>
			// 		{npssectionText}
			// 	</div>
			// );

			return (
				<div>
					<h3 className="page-header"><Tasks /> Overall Experience</h3>
					{this.props.nps_section ? (
						<div>
							{/* <label className="control-label">How would you rate your overall visit/call experience?</label> */}
							<label className="control-label">How would you rate the brand you audited for its product/services ?</label>

							<div className="row">
								<div className="col-md-10">
									<div className="star-rating star-rating-lg">
										{[...Array(10)].map((_, i) => {
											const ratingValue = 10 - i;
											return (
												<React.Fragment key={ratingValue}>
													<label htmlFor={`understanding_${ratingValue}-stars`} className={`star ${this.props.nps_section >= ratingValue ? "selected" : ""}`} title={ratingValue.toString()}>&#9733;</label>
												</React.Fragment>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					) : (
						null
					)}
				</div>
			);

		}
	}
}


export default connect()(__NpsSection);