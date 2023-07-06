import $ from "jquery";
import { url } from "../../../config.js";

export function findCategories(){
	return $.get( url.api_base_path + "manager/category");
}

export function findById(categoryId){
	return $.get( url.api_base_path + `manager/category/${categoryId}`);
}

export function addCategory(name){
	return $.ajax({
		url: url.api_base_path + "manager/category",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateCategory(categoryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteCategory(categoryId){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		type: "DELETE"
	});
}
//---------------------------------------------------------------------------------------------
export function findSubCategories(){
	return $.get( url.api_base_path + "manager/subcategory_sub");
}

export function findSubCategoryById(subcategoryId){
	return $.get( url.api_base_path + `manager/subcategory_sub/${subcategoryId}`);
}

export function addSubCategory(name){
	return $.ajax({
		url: url.api_base_path + "manager/subcategory_sub",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateSubCategory(subcategoryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/subcategory_sub/${subcategoryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteSubCategory(subcategoryId){
	return $.ajax({
		url: url.api_base_path + `manager/subcategory_sub/${subcategoryId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findTaxes(){
	return $.get( url.api_base_path + "manager/tax");
}

export function findTaxById(taxId){
	return $.get( url.api_base_path + `manager/tax/${taxId}`);
}

export function addTax(name,rate){
	return $.ajax({
		url: url.api_base_path + "manager/tax",
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function updateTax(taxId, name,rate){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function deleteTax(taxId){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findIndustries(){
	return $.get( url.api_base_path + "manager/industry");
}

export function findIndustryById(industryId){
	return $.get( url.api_base_path + `manager/industry/${industryId}`);
}

export function addIndustry(name){
	return $.ajax({
		url: url.api_base_path + "manager/industry",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateIndustry(industryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteIndustry(industryId){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findInterestAreas(){
	return $.get( url.api_base_path + "manager/interested_area");
}

export function findInterestAreaById(interestareaId){
	return $.get( url.api_base_path + `manager/interested_area/${interestareaId}`);
}

export function addInterestArea(name){
	return $.ajax({
		url: url.api_base_path + "manager/interested_area",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateInterestArea(interestareaId, name){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteInterestArea(interestareaId){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findSolutions(){
	return $.get( url.api_base_path + "manager/solution");
}

export function findSolutionById(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}`);
}

export function addSolution(solution){
	return $.ajax({
		url: url.api_base_path + "manager/solution",
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}

export function updateSolution(solutionId,solution){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}


export function deleteSolution(solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		type: "DELETE"
	});
}
export function updateSolutionIsActive(solutionId, solution) {
	return $.ajax({
	  url: url.api_base_path + `manager/solution_status/${solutionId}`,
	  method: "POST",
	  data: JSON.stringify(solution),
	  contentType: "application/json",
	});
  }

//  *****************************************************************************
  export function findArchievedSolutions(){
	return $.get( url.api_base_path + "manager/solution_archieved");
} 
// ******************************************************************************
export function findAttachmentsBySolution(solutionId){
	return $.get(url.api_base_path + `manager/solution/${solutionId}/attachment`);

}
export function completeAttachment(attachmentId,solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/complete`,
		type: "POST",
		data: JSON.stringify(solutionId),
		contentType: "application/json"
	});
}
export function doAttachmentUpload(url, file,solutionId){
	let mainPromise = $.Deferred();

	let payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	let req = $.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("x-amz-credential", post_data.fields["x-amz-credential"]);
		formData.append("x-amz-algorithm", post_data.fields["x-amz-algorithm"]);
		formData.append("x-amz-date", post_data.fields["x-amz-date"]);
		formData.append("x-amz-signature", post_data.fields["x-amz-signature"]);
		formData.append("acl", post_data.fields.acl);
		formData.append("policy", post_data.fields.policy);
		formData.append("key", post_data.fields.key);
		formData.append("success_action_status", "201");
		formData.append("file", file);

		$.ajax({
			url: post_data.url,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			xhr: function() {
				let myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener("progress",function(e){
						if(e.lengthComputable){
							let max = e.total;
							let current = e.loaded;

							let percentage = (current * 100)/max;
							mainPromise.notify("UPLOAD_PROGRESS", percentage);
						}
					}, false);
				}
				return myXhr;
			},
		}).then(function(){
			completeAttachment(post_data.attachment.id,solutionId).then(function(){
				mainPromise.resolve();
			}, function(){
				mainPromise.reject("There was an error, please try again.");
			});
		}, function(){
			mainPromise.reject("There was an error, please try again.");
		});
	});

	req.fail(function(err){
		if(err && err.responseJSON && err.responseJSON.non_field_errors){
			mainPromise.reject(err.responseJSON.non_field_errors[0]);
		} else {
			mainPromise.reject("There was an error, please try again.");
		}
	});

	return mainPromise;
}
export function uploadFileForSolutions(solutionId,file){
	var req_url = url.api_base_path + `manager/solution/${solutionId}/attachment`;
	return doAttachmentUpload(req_url, file,solutionId);
}

export function deleteAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}`,
		type: "DELETE"
	})

}