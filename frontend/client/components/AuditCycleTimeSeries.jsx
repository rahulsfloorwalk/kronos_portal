import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {demo} from '../../config.js';
import {fetchAuditCyclesTimeSeries} from '../service/audit_cycle.js';

var AuditCycleTimeSeries = React.createClass({
	getInitialState: function(){
		return null;
	},
	create_structure: function(ts){
		let data = [];
		for(let i=0; i < ts.section_master.length; i++){
			let obj = {};
			obj['name'] = ts.section_master[i];
			for(let j=0; j < ts.audit_cycle_master.length; j++){
				obj[ts.audit_cycle_master] = ts.values[j][i];
			}
			data.push(obj);
		}
		return data;
	},
	create_bars: function(){

		let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		let bar_arr = []
		for(let i=0; i < this.state.labels.length; i++){
			bar_arr.push(<Bar dataKey={this.state.labels[i]} barSize={30} fill={colors[i]} label/>);
		}
		this.setState({
			'bars': bar_arr,
		});
	},

	componentDidMount: function(){
		if(!demo){
			let ts = fetchAuditCyclesTimeSeries().then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					'data': ts_structure,
					'labels': reportData.audit_cycle_master,
					'title': reportData.title
				});
				this.create_bars();
			});
		}
	},

	render : function(){
    const data = [
      {name: 'Welcome & Reception', January: 40, February: 60, March: 70},
      {name: 'Need Analysis', January: 45, February: 40, March: 50, April: 22},
      {name: 'Presentation', January: 60, February: 70, March: 75, April: 29},
      {name: 'Test Drive', January: 70, February: 75, March: 75, April: 20},
      {name: 'Negotiation & Follow up', January: 60, February: 50, March: 70, April: 21},
      {name: 'Facility', January: 30, February: 60, March: 70, April: 25},
      {name: 'Visit Confirmation', January: 50, February: 60, March: 65, April: 21},
    ];
    if (demo){
			console.log('Rendering demo data')
  		return(
  			<div className="container">
  				<div className="row">
  					<br/>
  					<br/>
  					<div className="col-md-12">
            <h1>Q4 - Audit cycle summary</h1>
            <br/>
  					<BarChart width={1000} height={300} data={data} margin={{top: 25, right: 30, left: 20, bottom: 5}}>
  						<XAxis dataKey="name"/>
  						<YAxis/>
  						<Tooltip/>
  						<Legend />
  						<Bar dataKey="January" fill="#4ca9d7" label/>
  						<Bar dataKey="February" fill="#0085c6" label/>
              <Bar dataKey="March" fill="#005d8a" label/>
  					</BarChart>
  					</div>
  				</div>
  			</div>
  		);
    }
    else if (this.state != null){
      console.log('Rendering real data')
			console.log(this.state)
			return(
  			<div className="container">
  				<div className="row">
  					<br/>
  					<br/>
  					<div className="col-md-12">
            <h1>{this.state.title}</h1>
            <br/>
  					<BarChart layout="vertical" width={1000} height={600} data={this.state.data} margin={{top: 25, right: 30, left: 50, bottom: 5}}>
  						<XAxis type="number"/>
  						<YAxis dataKey="name" type="category"/>
  						<Tooltip/>
  						<Legend />
							{this.state.bars}

  					</BarChart>
  					</div>
  				</div>
  			</div>
  		);
    }
		else{
			console.debug('demo is false and no data available. hence chart not rendering')
      return null;
		}
	},
});

export default AuditCycleTimeSeries;
