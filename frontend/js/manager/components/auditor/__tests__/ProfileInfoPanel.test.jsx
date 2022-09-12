import React from "react";
import  ProfileInfoPanel  from "../ProfileInfoPanel";
import {fetchProfileInfoForAuditor, fetchRatingForAuditor} from "../../../service/auditor.js";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";

jest.mock("../../../service/auditor.js");

const sampleResult = {
	"id": 1520,
	"first_name": "Abc",
	"last_name": "Def",
	"gender": "M",
	"marital_status": "S",
	"education": "GR",
	"mobile_number": "1234567890",
	"date_of_birth": "1990-06-10",
	"address": "119,bajiprabhunagar,Nagpur",
	"pincode": "440033",
	"city": {
		"id": 1,
		"name": "Nagpur",
		"state": "IN-MH",
		"lat": "21.145800",
		"lon": "79.088155",
		"gmaps_url": "http://maps.google.com/maps/place/Nagpur/@21.145800,79.088155,12z"
	},
	"user_id": 1709,
	"is_complete": true,
	"average_rating": 1.667,
};

const sampleResultNullRating = {
	"id": 1520,
	"first_name": "Abc",
	"last_name": "Def",
	"gender": "M",
	"marital_status": "S",
	"education": "GR",
	"mobile_number": "1234567890",
	"date_of_birth": "1990-06-10",
	"address": "119,bajiprabhunagar,Nagpur",
	"pincode": "440033",
	"city": {
		"id": 1,
		"name": "Nagpur",
		"state": "IN-MH",
		"lat": "21.145800",
		"lon": "79.088155",
		"gmaps_url": "http://maps.google.com/maps/place/Nagpur/@21.145800,79.088155,12z"
	},
	"user_id": 1709,
	"is_complete": true,
	"average_rating": null,
};

const sampleRating = {
	auditor_rating: [
		{"rating": 1, "avg": 20},
		{"rating": 2, "avg": 30},
		{"rating": 3, "avg": 10},
		{"rating": 4, "avg": 40},
		{"rating": 5, "avg": 0},
	]
};

const sampleNullRating = {
	auditor_rating: []
};

describe("<ProfileInfoPanel />", () => {

	it("renders profile info correctly when rating is not null", (done) => {
		fetchProfileInfoForAuditor.mockResolvedValue(sampleResult);
		fetchRatingForAuditor.mockResolvedValue(sampleRating);
		const r = renderer.create(<ProfileInfoPanel auditorId={sampleResult["id"]} />);

		setTimeout(() =>{
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders profile info correctly when rating is null", (done) => {
		fetchProfileInfoForAuditor.mockResolvedValue(sampleResultNullRating);
		fetchRatingForAuditor.mockResolvedValue(sampleNullRating);
		const r = renderer.create(<ProfileInfoPanel auditorId={sampleResultNullRating["id"]} />);

		setTimeout(() =>{
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("calls fetchProfileInfoForAuditor with the correct id", () => {
		fetchProfileInfoForAuditor.mockResolvedValue(sampleResult);
		fetchRatingForAuditor.mockResolvedValue(sampleRating);
		shallow(<ProfileInfoPanel auditorId={sampleResult["id"]} />);
		expect(fetchProfileInfoForAuditor).toBeCalledWith(sampleResult["id"]);
	});

});

