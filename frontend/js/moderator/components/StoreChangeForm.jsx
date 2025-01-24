import React from "react";
import PropTypes from "prop-types";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

export default class StoreChangeForm extends React.Component {
	static propTypes = {
		stores: PropTypes.array,
		selectedStoreId: PropTypes.number,
		onSubmit: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		errors: PropTypes.object,
		loading: PropTypes.bool,
	};

	state = {
		earnings_per_audit: 0,
		storeId: null,
	};

	componentDidMount() {
		if ( this.props.selectedStoreId !== undefined && this.props.selectedStoreId !== null){
			this.setState({ storeId: this.props.selectedStoreId });
		}
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.selectedStoreId !== prevProps.selectedStoreId &&
			this.props.selectedStoreId !== undefined &&
			this.props.selectedStoreId !== null
		) {
			this.setState({ storeId: this.props.selectedStoreId });
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit(this.state.storeId);
	};

	render() {
		let storeElement = (
			<select className="form-control" onChange={(e) => this.setState({ storeId: e.target.value })} value={this.state.storeId} >
				<option value="">Select Status</option>
				{this.props.stores.length > 0 ? (
					this.props.stores.map((store) => (
						<option key={store.id} value={store.id}> {store.name}</option>
					))
				) : (
					<option disabled value=""> No stores available </option>
				)}
			</select>
		);

		let submitStore = (
			<button type="button" className="btn btn-primary" style={{ marginTop: "2rem" }} onClick={this.onSubmit} > Change Store </button>
		);

		const modalTitle = "Change Store";
		if (this.props.loading) {
			return (
				<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
					<Loading />
				</Modal>
			);
		}
		return (
			<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors} />
					{storeElement}
					{submitStore}
				</form>
			</Modal>
		);
	}
}