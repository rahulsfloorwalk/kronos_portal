import React from "react";
import  ProfileInfoPanel  from "../ProfileInfoPanel";
import {fetchProfileInfoForAuditor} from "../../../service/auditor.js";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
import $ from "jquery";

jest.mock("../../../service/auditor.js");

const sampleResults = {
	"id": 1709,
	"username": "abc@gmail.com",
	"email": "abc@gmail.com",
	"is_active": true,
	"date_joined": "2016-12-14T11:34:29.305109Z",
	"last_login": "2016-12-14T11:39:28.612415Z",
	"profileinfo": {
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
	},
	"verification": {
		"id": 1700,
		"key_expires": "2016-12-16T11:34:29Z",
		"is_verified": true,
		"user_id": 1709
	}
}

const sampleResultNullRating = {
	"id": 1709,
	"username": "abc@gmail.com",
	"email": "abc@gmail.com",
	"is_active": true,
	"date_joined": "2016-12-14T11:34:29.305109Z",
	"last_login": "2016-12-14T11:39:28.612415Z",
	"profileinfo": {
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
	},
	"verification": {
		"id": 1700,
		"key_expires": "2016-12-16T11:34:29Z",
		"is_verified": true,
		"user_id": 1709
	}
}

describe("<ProfileInfoPanel />", () => {

	it("renders profile info correctly when rating is not null", (done) => {
		const promise = $.Deferred();
		fetchProfileInfoForAuditor.mockReturnValue(promise);
		promise.resolve(sampleResults);

		setTimeout(() =>{
			const r = renderer.create(<ProfileInfoPanel auditorId={sampleResults["id"]} />);
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders profile info correctly when rating is null", (done) => {
		const promise = $.Deferred();
		fetchProfileInfoForAuditor.mockReturnValue(promise);
		promise.resolve(sampleResults);

		setTimeout(() =>{
			const r = renderer.create(<ProfileInfoPanel auditorId={sampleResultNullRating["id"]} />);
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

});