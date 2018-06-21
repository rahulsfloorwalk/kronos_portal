import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Text} from "recharts";

import {demo} from "../../../config.js";

import Loading from "../../components/Loading.jsx";

import { fetchConfig } from "../service/config.js";
import { fetchUser } from "../service/user.js";

/*-----------------*/

import $ from "jquery"

let fetchImpactFactorData = () => {
	return fetchConfig().then((config) => {
		return $.get(config.IMPACT_FACTOR_URL);
	});
};

/*-----------------*/

var FakeImpactFactor = React.createClass({
	getInitialState: function(){
		return {
			clientUser: null,
			labels: [],
			impactFactors: {},
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},

	componentDidMount: function(){
		this.setLoading(true);
		fetchUser().then((clientUser)=>{
			this.setState({
				clientUser
			});
		}).always(() => this.setLoading(false));

		fetchImpactFactorData().then(impactFactors => {
			this.setState({
				impactFactors,
			});
		}, err => {
			this.setState({
				impactFactors: {},
			});
		});
	},

	tickFunction: function( values){
		// lol hack
		let count = this.state.data && this.state.data.length > 0 ? this.state.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	},

	render : function(){
		let clientSpecificData;
		let chart;

		if(this.state.loading){
			chart = <Loading/>;
		} else if(this.state.clientUser){

			let colors = ["#ffad33", "#ff9900", "#cc7a00"];

			let clientId = this.state.clientUser.client.id;
			let auditType = this.props.auditType;

			if( this.state.impactFactors[clientId]
				&& this.state.impactFactors[clientId][auditType]
				&& typeof this.state.impactFactors[clientId][auditType] === "object"){

				let dataset = this.state.impactFactors[clientId][auditType];
				let barKeys = dataset.barKeys;
				let data = dataset.data;

				chart = (
				<ResponsiveContainer width="100%" aspect={3 / 1}>
				<BarChart data={data} margin={{top: 25, right: 5, left: 5, bottom: 30}}>
				<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
				<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
				<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
				<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
				{ barKeys.map( (k, i) => <Bar key={k} barSize={40} dataKey={k} fill={colors[i]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>) }
				</BarChart>
				</ResponsiveContainer>
				);

			} else {
				return null;
			}
		} else {
			return null;
		}
		return(
			<div>
				<h3 className="text-center">Impact Factor Analysis</h3>
				{chart}
			</div>
		);
	},
});

export default FakeImpactFactor;
