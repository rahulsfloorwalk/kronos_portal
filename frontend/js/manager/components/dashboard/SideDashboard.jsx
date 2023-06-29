import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Retweet, ChevronRight, ChevronDown } from "../../../components/Icons.jsx";
import { pointerStyle } from "../../../styles.js";
import { findTrainers } from "../../service/trainer.js";
import NavLink from "../../../components/NavLink.jsx";
import { dataaccordian } from "../../../constants.js";
import "../../../../css/bs_overrides.scss";

export default class SideDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isIndex: 0,
    };
  }

  handleClick(index) {
    if (index === this.state.isIndex) {
      this.setState({ isIndex: 0 });
    } else {
      this.setState({ isIndex: index });
    }
  }
  render() {
    return (
      <div>
        <ul className="dashboard_links">
          <li style={{ marginBottom: "2rem", paddingTop: "2rem" }} className="question">
            <Link to={`/admindashboard`} style={{ color: "#2148d5" }}>Dashboard</Link>
          </li>
          {dataaccordian.map((item) => {
            return (
              <div className="text_container" key={item.id}>
                <div className="question" onClick={() => this.handleClick(item.id)} style={pointerStyle}>
                  <li>{item.heading}</li>
                  <button
                    className="toggle_btn"
                  >
                    {this.state.isIndex === item.id ? (
                      <span><ChevronDown /></span>
                    ) : (
                      <span><ChevronRight /></span>
                    )}
                  </button>
                </div>

                <div
                  className={
                    this.state.isIndex === item.id
                      ? "answer display_answer"
                      : "answer"
                  }
                >
                  {item.subheading.map((subitem) => {
                    return (
                      <Link to={subitem.link}>{subitem.name}</Link>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </ul>
        <div>
          <h5 style={{ fontSize: "1.6rem", fontWeight: "bold" }}>Floorwalk Admin Dashboard</h5>
          <p>2023 All Rights Reserved</p>
        </div>
      </div>
    );
  }
}
