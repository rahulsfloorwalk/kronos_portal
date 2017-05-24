import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

import {demo} from '../../config.js';

import Loading from '../../js/components/Loading.jsx';

import {fetchAuditCyclesTimeSeries} from '../service/audit_cycle.js';

var AuditCycleTimeSeries = React.createClass({
	getInitialState: function(){
		return {
			loading: false
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},
	create_structure: function(ts){
		let data = [];
		for(let i=0; i < ts.section_master.length; i++){
			let obj = {};
			obj['name'] = ts.section_master[i];
			for(let j=0; j < ts.audit_cycle_master.length; j++){
				obj[ts.audit_cycle_master[j]] = ts.values[j][i];
			}
			data.push(obj);
		}
		return data;
	},
	create_bars: function(){

		let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		let bar_arr = []
		for(let i=0; i < this.state.labels.length; i++){
			bar_arr.push(<Bar key={i} dataKey={this.state.labels[i]} barSize={30} fill={colors[i]} label/>);
		}
		this.setState({
			'bars': bar_arr,
		});
	},

	reloadData: function(auditType){
		if(!demo){
			this.setLoading(true);
			let ts = fetchAuditCyclesTimeSeries(auditType).then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					'data': ts_structure,
					'labels': reportData.audit_cycle_master,
					'title': reportData.title
				});
				this.create_bars();
			}).always( () => this.setLoading(false));
		}
	},

	componentDidMount: function(){
		//console.debug("AuditCycleTimeSeries","componentDidMount");
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("AuditCycleTimeSeries","componentWillReceiveProps", nextProps.auditType);
		this.reloadData(nextProps.auditType);
	},

	render : function(){
		let chart;
		if(this.state.loading){
			chart = <Loading/>;
		} else {
			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart width={1000} height={300} data={this.state.data} margin={{top: 25, right: 30, left: 50, bottom: 5}}>
			<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<XAxis dataKey="name" type="category"/>
			<Tooltip formatter={v => v + "%"}/>
			<Legend />
			{this.state.bars}

			</BarChart>
			</ResponsiveContainer>
			);
		}
		return(
			<div>
				<h3 className="text-center">{this.state.title}</h3>
				{chart}
			</div>
		);
	},
});

export default AuditCycleTimeSeries;
