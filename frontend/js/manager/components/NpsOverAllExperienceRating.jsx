import React, { Component } from "react";
import PropTypes from "prop-types";
import { setNpsOverallExperienceRating } from "../service/audit_store";
import Alert from "react-s-alert";

const MAX_RATING = 10;

const ratingOptions = Array.from(
	{ length: MAX_RATING },
	(_, i) => i + 1
);
export default class NpsOverallExperienceRating extends Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		editable: PropTypes.bool,
		rating: PropTypes.number,
	};

	static defaultProps = {
		editable: true,
		rating: 0,
	};

	constructor(props) {
		super(props);

		this.state = {
			rating: props.rating,
		};
	}

	ratingSelected = (rating) => {
		const previousRating = this.state.rating;

		this.setState({ rating });

		setNpsOverallExperienceRating(this.props.auditStoreId, rating).then(
			() => {
				Alert.success("OVERALL EXPERIENCE SAVED");
			},
			() => {
				this.setState({ rating: previousRating });
				Alert.error("FAILED TO SAVE OVERALL EXPERIENCE");
			}
		);

		// if (this.props.onRatingChange) {
		//     this.props.onRatingChange(rating);
		// }
	};


	render() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">
						Overall Experience
					</h4>
				</div>

				<div className="panel-body">
					<h4 style={{ marginBottom: 20 }}>
						How likely are you to rate the brand you audited for its products/services?
					</h4>

					<div className="form-group">
						<div
							style={{
								display: "inline-flex",
								gap: "6px",
								alignItems: "center",
							}}
						>
							{ratingOptions.map((star) => (
								<React.Fragment key={star}>
									<input
										type="radio"
										id={`overall-${star}`}
										name="overall-rating"
										checked={this.state.rating === star}
										disabled={!this.props.editable}
										onChange={() => this.ratingSelected(star)}
										style={{ display: "none" }}
									/>

									<label
										htmlFor={`overall-${star}`}
										style={{
											fontSize: "36px",
											color: star <= this.state.rating ? "#f9b000" : "#ddd",
											cursor: this.props.editable ? "pointer" : "default",
											margin: 0,
										}}
									>
										★
									</label>
								</React.Fragment>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
}