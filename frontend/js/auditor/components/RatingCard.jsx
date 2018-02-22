import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import {getColor} from '../../utils.js'

// import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

var RatingCard = React.createClass({
	componentWillMount: function(){
		// this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		console.log("rendering rating")
		console.log(this.props);
    let sampleData = [
      {color:1, name:'Audit Quality', score: this.props.score.audit},
      {color:3, name:'Report Quality', score: this.props.score.report},
      {color:2, name:'Overall Conduct', score: this.props.score.conduct},
    ]
    var chartRows = [];
    let counter = 0;
    for(let i in sampleData){
      counter++;
      let progressClass = getColor(sampleData[i].color);
      chartRows.push(<tr key={counter}>
          <td className="col-md-3"><b className="pull-left">{sampleData[i].name} &emsp;</b></td>
          <td className="col-md-9">
          <div className="progress">
              <div className={"progress-bar " + "progress-bar-" + progressClass } style={{width: sampleData[i].score + "%"}}>
            {sampleData[i].score}%
            </div>
          </div>
          </td>
        </tr>);
    }

    if( chartRows.length === 0){
			chartRows.push(<div key="empty" className="list-group-item text-muted text-center">no data here yet</div>);
		}
		if(Object.keys(this.props.score).length === 0){
			return(
				<div className="col-md-12">
	  			<div className="panel text-center">
	          <div className="panel-heading">
	            <h3>Auditor Score</h3>
	          </div>
						<div className="panel-body">
							<h4>No data..</h4>
	          </div>
	  			</div>

	      </div>
			);
		}
		return (
      <div className="col-md-12">
  			<div className="panel text-center">
          <div className="panel-heading">
            <h3>Auditor Score</h3>
          </div>
          <table>
            <tbody>
              {chartRows}
            </tbody>
          </table>
  			</div>

      </div>
		);
	},
});

export default RatingCard;
