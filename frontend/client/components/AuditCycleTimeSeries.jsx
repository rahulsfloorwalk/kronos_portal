import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {demo} from '../../config.js';

var AuditCycleTimeSeries = React.createClass({

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
    else{
      console.debug('demo is false. hence chart not rendering')
      return null;
    }
	},
});

export default AuditCycleTimeSeries;
