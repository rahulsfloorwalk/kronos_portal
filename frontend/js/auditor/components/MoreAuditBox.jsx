import React from "react";
import * as ReactRedux from "react-redux";
import PropTypes from "prop-types";
import FormSelect from "../../components/FormSelect.jsx";

import { affectInputEventToComponent } from "../../react_utils.js";
import { fetchProfileInfo} from "../actions/profile_info.js";
import { fetchStatesByCountry, fetchCities, fetchCountries } from "../actions/location_info.js";

class __CountrySelector extends React.Component {
	static propTypes = {
		countries: PropTypes.object,
	};

	render() {
		let countryOptions = [];
		for( let c in this.props.countries){
			countryOptions.push(<option key={c} value={c}>{this.props.countries[c]}</option>);
		}
		return (
			<FormSelect label="Country" required_mark={true} name="country" {...this.props}>
				<option value=""></option>
				{countryOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCountrySelector = function(store){
	return {
		countries: store.countries,
	};
};

var CountrySelector = ReactRedux.connect(mapStoreToPropsForCountrySelector)(__CountrySelector);
/* State Selector begins */

class __StateSelector extends React.Component {
	static propTypes = {
		states: PropTypes.object,
	};

	render() {
		let stateOptions = [];
		for( let s in this.props.states){
			stateOptions.push(<option key={s} value={s}>{this.props.states[s]}</option>);
		}
		return (
			<FormSelect label="State" required_mark={true} name="state" {...this.props}>
				<option value=""></option>
				{stateOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForStateSelector = function(store){
	return {
		states: store.country_states,
	};
};

var StateSelector = ReactRedux.connect(mapStoreToPropsForStateSelector)(__StateSelector);

/* State Selector Ends */

/* City Selector Starts */

class __CitySelector extends React.Component {
	static propTypes = {
		state: PropTypes.string,
		cities: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		})),
	};

	static defaultProps = {
		state: null,
	};

	render() {
		let cityOptions = [];
		for( let c of this.props.cities){
			if( c.state === this.props.state){
				cityOptions.push(<option key={c.id} value={c.id}>{c.name}</option>);
			}
		}
		return (
			<FormSelect label="City" required_mark={true} name="city_id" {...this.props}>
				<option value=""></option>
				{cityOptions}
			</FormSelect>
		);
	}
}

var mapStoreToPropsForCitySelector = function(store){
	return {
		cities: store.cities,
	};
};

var CitySelector = ReactRedux.connect(mapStoreToPropsForCitySelector)(__CitySelector);

/* City Selector Ends */


class MoreAuditBox extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		onSearch: PropTypes.func.isRequired,
		message: PropTypes.string
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			toggle_view: false,
			error: "",
			// country: "IN"
		};
	}

	componentDidMount(){
		// this.props.dispatch(fetchStatesByCountry(this.state.country));
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchProfileInfo()),
			this.props.dispatch(fetchCountries()),
			// this.props.dispatch(fetchStates()),
		]).then(([profileInfo] )=> {
			this.setLoading(false);
			this.setState(profileInfo);
			if(profileInfo.city){
				this.setState({
					state: profileInfo.city.state,
					country: profileInfo.city.country,
				});
				this.props.dispatch(fetchStatesByCountry(profileInfo.city.country)),
				this.props.dispatch(fetchCities(profileInfo.city.state));
			}
		});
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};
	myCountryChanged = (e) => {
		this.inputChanged(e);
		if(e.target.value){
			this.props.dispatch(fetchStatesByCountry(e.target.value));
			this.setState({
				state: ""
			});
		} else {
			this.setState({
				state: "",
				city_id: "",
			});
		}
	};
	myStateChanged = (e) => {
		this.inputChanged(e);
		if(e.target.value){
			this.props.dispatch(fetchCities(e.target.value));
		} else {
			this.setState({
				state: "",
				city_id: "",
			});
		}
	};

	toggleView = () => {
		this.setState((prevState)=>{
			return({
				toggle_view: !prevState.toggle_view
			});
		});
	};

	SearchAudit = () => {
		this.setLoading(true);
		if(this.state.city_id){
			this.props.onSearch(this.state.city_id);
			this.setState({
				error:"",
				loading: false
			});
		}
		else{
			this.setState({
				error: "Please select a location",
				loading: false
			});
		}
	};
	render(){
		let displayBlock = this.state.toggle_view ? "block" : "none";
		return(
			<div className="col-md-12">
				<div className="row col-md-12" style={{ marginBottom:"10px"}}>
					<button type="button" className="btn btn-primary" onClick={this.toggleView}>
						Travelling to a new city?
					</button>
				</div>
				<div className="row" style={{marginBottom:"15px", display:displayBlock}}>
					<div className=" col-md-12 well">
						<div className="col-md-12">
							<h4 style={{borderBottom:"solid 1px #eee",paddingBottom:"10px"}}>
								<b>Select Location</b>
							</h4>
						</div>
						<div className="col-md-12">
							<p className="text-danger"><b>{this.state.error}{this.props.message}</b></p>
						</div>
						<div className="col-md-3">
							<CountrySelector value={this.state.country} onChange={this.myCountryChanged} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-3" style={{marginBottom:"10px"}}>
							<StateSelector value={this.state.state} onChange={this.myStateChanged} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-3" style={{marginBottom:"10px"}}>
							<CitySelector state={this.state.state} value={this.state.city_id} onChange={this.inputChanged} disabled={this.state.submitting}/>
						</div>
						<div className="col-md-3">
							<br/>
							<button type="button" className="btn btn-primary" onClick={this.SearchAudit} disabled={this.state.loading}>Search</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ReactRedux.connect()(MoreAuditBox);