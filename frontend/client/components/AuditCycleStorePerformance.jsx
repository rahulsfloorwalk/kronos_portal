import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

import {demo} from '../../config.js';

import {fetchAuditCycleStorePerformance} from '../service/audit_cycle.js';

import Loading from '../../js/components/Loading.jsx';

var AuditCycleStorePerformance = React.createClass({
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
	create_structure: function(input_data){
    let data_arr = input_data.data;
    let label_arr = input_data.columns
    if(this.props.type === "worst"){
      data_arr.reverse();
    }
		let data = [];
    let size = Math.min(5, data_arr.length);
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
	create_bars: function(){

    let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
    if (this.state.type === "best"){
      colors = ["#99B864", "#81AA40", "#688833"];
    }
    else if (this.state.type === "worst"){
      colors = ["#D94E47", "#D0231A", "#A61C14"];
    }
		let bar_arr = []
		for(let i=0; i < this.state.labels.length; i++){
			bar_arr.push(<Bar key={i} dataKey={this.state.labels[i]} barSize={20} fill={colors[i]} label/>);
		}
		this.setState({
			'bars': bar_arr,
		});
	},

	reloadData: function(auditType){
		if(!demo){
			this.setLoading(true);
			let ts = fetchAuditCycleStorePerformance(this.props.auditType).then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					'data': ts_structure,
					'labels': reportData.columns.reverse(),
					'title': this.props.title,
					'type': this.props.type
				});
				this.create_bars();
			}).always(() => this.setLoading(false));
		}
	},

	componentDidMount: function(){
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		this.reloadData(nextProps.auditType);
	},

	render : function(){
		let chart;
		if(this.state.loading){
			chart = <Loading/>;
		} else {
			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart width={600} height={300} data={this.state.data} margin={{top: 25, right: 10, left: 10, bottom: 5}}>
			<XAxis dataKey="name"/>
			<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<Tooltip formatter={v => v+"%"}/>
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
	}
});

export default AuditCycleStorePerformance;
