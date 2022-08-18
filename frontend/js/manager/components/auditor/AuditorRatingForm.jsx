import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchAuditorRating, saveAuditorRating } from "../../service/auditor.js";

import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

export default class AuditorRatingForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.number
			]).isRequired
		})
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			rating: null
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, {loading}));

	componentDidMount() {
		this.setLoading(true);
		fetchAuditorRating(this.props.params.auditorId).done((rating) => {
			this.setState({rating: rating.avg_auditor_rating});
		}).always(() => this.setLoading(false));
	}

	onSubmit = (e) => {
		e.preventDefault();
		saveAuditorRating(this.props.params.auditorId, this.state.rating).done(() => {
			hashHistory.goBack();
		});
	};

	ratingSelected = (rating) => {
		this.setState({rating});
	};

	render(){
		return ( <Modal modalTitle="Rate Auditor" onClose={hashHistory.goBack}>
			{ ! this.state.loading ?
				<form onSubmit={this.onSubmit}>
					<div className="form-group">
						<label className="control-label">Auditor Rating:</label>
						<div className="btn-group btn-group-justified">
							<div className="btn-group">
								<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 1 ? "active" : "")} onClick={() => this.ratingSelected(1)}>Worse</button>
							</div>
							<div className="btn-group">
								<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 2 ? "active" : "")} onClick={() => this.ratingSelected(2)}>Average</button>
							</div>
							<div className="btn-group">
								<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 3 ? "active" : "")} onClick={() => this.ratingSelected(3)}>Good</button>
							</div>
							<div className="btn-group">
								<button type="button" className={"btn btn-lg btn-default " + (this.state.rating === 4 ? "active" : "")} onClick={() => this.ratingSelected(4)}>Excellent</button>
							</div>
						</div>
					</div>
					<button className="btn btn-lg btn-primary">Save Rating</button>
				</form>
				: <Loading/>
			}
		</Modal>);
	}
}
