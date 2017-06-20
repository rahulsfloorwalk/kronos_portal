import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import { Text } from 'recharts';

import {demo} from '../../config.js';

import {fetchAuditCycleStorePerformance} from '../service/audit_cycle.js';

import Loading from '../../js/components/Loading.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

var AuditCycleStorePerformance = React.createClass({
	getDefaultProps: function(){
		return {
			type: "best",
		};
	},
	create_structure: function(input_data){
		let data_arr = input_data.data;
		let label_arr = input_data.columns
		let size = this.props.type === "all" ? data_arr.length : 5;

		if(this.props.type === "worst"){
			data_arr.reverse();
		}
		let data = [];
		for(let i=0; i < size; i++){
			let obj = {};
			obj['name'] = data_arr[i][0].name;
			for(let j=0; j < label_arr.length; j++){
				obj[label_arr[j]] = data_arr[i][1][j];
			}
			data.push(obj);
		}
		return data;
	},

	tickFunction: function( values){
		// lol hack
		let count = this.props.reportData && this.props.reportData.data.length > 0 ? this.props.reportData.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	},

	render : function(){
		let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		if (this.props.type === "best" || this.props.type === "all"){
			colors = ["#688833", "#30AD23", "#11772D"];
		}
		else if (this.props.type === "worst"){
			colors = ["#D94E47", "#D0231A", "#A61C14"];
		}
		let bars = [];

		let labels = this.props.reportData.columns;
		for(let i=0; i < labels.length; i++){
			bars.push(<Bar key={i} dataKey={labels[i]} barSize={20} fill={colors[i]} label/>);
		}

		let data = this.create_structure(this.props.reportData);

		let chart = (
		<ResponsiveContainer width="100%" aspect={3 / 1}>
		<BarChart width={600} height={300} data={data} margin={{top: 25, right: 10, left: 10, bottom: 5}}>
		<XAxis dataKey="name" tick={this.tickFunction} interval={0}/>
		<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
		<Tooltip formatter={v => v+"%"}/>
		<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
		{bars}
		</BarChart>
		</ResponsiveContainer>
		);
		return(
			<div>
			<h3 className="text-center">{this.props.title}</h3>
			{chart}
			</div>
		);
	}
});

let AuditCycleStorePerformanceWrapper = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			reportData: null,
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},
	reloadData: function(auditType){
		if(!demo){
			this.setLoading(true);
			let ts = fetchAuditCycleStorePerformance(auditType).then((reportData) => {
				this.setState({
					'reportData': reportData
				});
			}).always(() => this.setLoading(false));
		}
	},
	componentDidMount: function(){
		//console.debug("AuditCycleStorePerformance","componentDidMount");
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("AuditCycleStorePerformance","componentWillReceiveProps", nextProps.auditType);
		if( this.props.auditType !== nextProps.auditType) {
			this.reloadData(nextProps.auditType);
		}
	},
	render: function(){
		if(this.state.loading || ! this.state.reportData ){
			return <Loading/>;
		} else if(this.state.reportData.data.length === 0 ){
			return (
				<div>
					<h3 className="text-center">Business Unit Performance</h3>
					<Jumbotron heading="" para="chart will be visible once reports are completed"/>
				</div>
			);
		} else if(this.state.reportData.data.length > 10) {
			return (
			<div className="row">
				<div className="col-md-6">
					<AuditCycleStorePerformance title="Best Performing Business Units" type="best" reportData={this.state.reportData}/>
				</div>
				<div className="col-md-6">
					<AuditCycleStorePerformance title="Worst Performing Business Units" type="worst" reportData={this.state.reportData}/>
				</div>
			</div>
			);
		} else {
			return (
			<AuditCycleStorePerformance title="Business Unit Performance" type="all" reportData={this.state.reportData}/>
			);
		}
	}
});

export default AuditCycleStorePerformanceWrapper;
