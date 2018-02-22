import React from "react";
import PropTypes from "prop-types";
import { } from "react-redux";
import { } from "react-router";

import { } from "../../styles.js";

import { } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import Checkbox from "../../components/Checkbox.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import StateSelector from "./StateSelector.jsx";

import { fetchCities } from "../service/city.js";
import { fetchPresence, setPresent } from "../service/presence.js";

class PresenceRow extends React.Component{
	static propTypes = {
		presence: PropTypes.object,
		city: PropTypes.object.isRequired,
		loading: PropTypes.bool,

		setPresence: PropTypes.func.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			strength: "",
		};
	}

	componentDidMount(){
		if(this.props.presence){
			this.setState({
				strength: this.props.presence.strength || "",
			});
		}
	}

	render(){
		let p = this.props.presence;
		let c = this.props.city;
		let loading = this.props.loading;
		return (<div className="panel panel-default">
			<div className="panel-body">
				<Checkbox checked={p && p.present} onChange={(val) => this.props.setPresence(c.id, val)} disabled={loading}/>
			&nbsp;<big>{c.name}</big>
			</div>
		</div>);
	}
}

export default class PresencePanel extends React.Component{
	static propTypes = {
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			cities: [],
			presences: [],
			loadingPresences: {},
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	componentDidMount(){
	}

	stateChanged = (stateCode) => {
		if(stateCode) {
			this.setLoading(true);
			Promise.all([
				fetchCities(stateCode),
				fetchPresence(stateCode),
			]).then(([cities, presences]) => {
				this.setState({
					cities,
					presences,
				});
			}).finally(()=>this.setLoading(false));
		} else {
			this.setState({
				cities: [],
				presences: [],
			});
		}
	};

	presenceUpdated = (newPresence) => {
		this.setState({
			presences: ((presences, toUpsert) => {
				let new_presences = [];
				let updated = false;
				for(let p of presences){
					if(p.id  === toUpsert.id){
						new_presences.push(toUpsert);
						updated = true;
					} else {
						new_presences.push(p);
					}
				}
				if(!updated){
					new_presences.push(toUpsert);
				}
				return new_presences;
			})(this.state.presences, newPresence)
		});
	};

	setPresenceLoading = ( cityId, loading) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loadingPresences: Object.assign({}, this.state.loadingPresences, {
					[cityId]: loading
				})
			});
		});
	};

	setPresence = (cityId, present) => {
		this.setPresenceLoading(cityId, true);
		setPresent(cityId, present).then(this.presenceUpdated).finally(() => this.setPresenceLoading(cityId, false));
	};

	render(){
		let cityItems = this.state.cities.map(c => [
			c,
			this.state.presences.find(p => p.city_id === c.id),
			!!this.state.loadingPresences[c.id],
		]).map(([c, p, loading]) => <div key={c.id} className="col-sm-6 col-md-3">
			<PresenceRow key={c.id} city={c} presence={p} loading={loading}
				setPresence={this.setPresence}
				setHasOffice={this.setHasOffice}
				setStrength={this.setStrength}/>
		</div>);

		return (
			<div className="">
				<div className="pull-right">
				</div>
				<h4 className="">
					<div style={{display: "inline-block",width:"200px"}}><StateSelector onChange={this.stateChanged}/></div>
					&nbsp;Please select all the cities that you can conduct audits in.
				</h4>
				{ this.state.loading ? <Loading/> : 
					<div className="row">
						{cityItems.length === 0 ? <Jumbotron heading="Select a State to begin"/> : cityItems}
					</div>
				}
			</div>
		);
	}
}
