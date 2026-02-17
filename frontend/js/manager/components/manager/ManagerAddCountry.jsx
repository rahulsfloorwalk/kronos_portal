import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import SaveButton from "../../../components/SaveButton.jsx";

import { fetchCountries } from "../../service/location.js";
import { addountries, findSelectedCountries, } from "../../service/manager.js";

export default class ManagerAddCountry extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string.isRequired,
		}),
	};

	state = {
		loading: true,
		countries: {},
		selectedCountries: [],
		submitting: false,
	};

	componentDidMount() {
		const { userId } = this.props.params;

		fetchCountries()
			.done((countries) => {
				this.setState({ countries });
			})
			.fail(() => {
				this.setState({ loading: false });
			});

		findSelectedCountries(userId)
			.done((res) => {
				this.setState({
					selectedCountries: res.allowed_countries || [],
					loading: false,
				});
			})
			.fail(() => {
				this.setState({ loading: false });
			});
	}

	onCheckboxChange = (countryCode) => {
		this.setState((prevState) => ({
			selectedCountries: prevState.selectedCountries.includes(countryCode)
				? prevState.selectedCountries.filter(
					(c) => c !== countryCode
				)
				: [...prevState.selectedCountries, countryCode],
		}));
	};

	onSubmit = (e) => {
		e.preventDefault();

		const { userId } = this.props.params;
		const { selectedCountries } = this.state;

		this.setState({ submitting: true });

		addountries(userId, selectedCountries)
			.done(() => {
				hashHistory.goBack();
			})
			.fail(() => {
				this.setState({ submitting: false });
			});
	};

	render() {
		const { loading, countries, selectedCountries, submitting } = this.state;

		if (loading) {
			return <Loading />;
		}

		return (
			<Modal modalTitle="Add Country" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row" style={{ paddingBottom: "3%" }}>
						{Object.entries(countries).map(([code, name]) => (
							<div className="col-sm-6 col-md-4" key={code}>
								<label
									style={{
										fontSize: "14px",
										marginBottom: "10px",
										display: "flex",
										alignItems: "center",
									}}
								>
									<input
										type="checkbox"
										checked={selectedCountries.includes(
											code
										)}
										onChange={() =>
											this.onCheckboxChange(code)
										}
										style={{
											width: "20px",
											height: "20px",
											marginRight: "8px",
										}}
									/>
									<span>{name}</span>
								</label>
							</div>
						))}
					</div>

					<SaveButton disabled={submitting} />
				</form>
			</Modal>
		);
	}
}