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
						<div className="star-rating star-rating-lg">
							<input type="radio" id="5-stars" name="rating" onChange={() => this.ratingSelected(5)} checked={this.state.rating === 5}/>
							<label htmlFor="5-stars" className="star">&#9733;</label>
							<input type="radio" id="4-stars" name="rating" onChange={() => this.ratingSelected(4)} checked={this.state.rating === 4}/>
							<label htmlFor="4-stars" className="star">&#9733;</label>
							<input type="radio" id="3-stars" name="rating" onChange={() => this.ratingSelected(3)} checked={this.state.rating === 3}/>
							<label htmlFor="3-stars" className="star">&#9733;</label>
							<input type="radio" id="2-stars" name="rating" onChange={() => this.ratingSelected(2)} checked={this.state.rating === 2}/>
							<label htmlFor="2-stars" className="star">&#9733;</label>
							<input type="radio" id="1-star" name="rating" onChange={() => this.ratingSelected(1)} checked={this.state.rating === 1}/>
							<label htmlFor="1-star" className="star">&#9733;</label>
						</div>
					</div>
					<button className="btn btn-lg btn-primary">Save Rating</button>
				</form>
				: <Loading/>
			}
		</Modal>);
	}
}
