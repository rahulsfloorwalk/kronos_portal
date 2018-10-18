
export default class LoadingSelectors {
	constructor(namespace){
		this.namespace = namespace;
	}

	getNamespacedStore = (store) => store[this.namespace];

	isLoading = (store, apiName) => {
		return !!this.getNamespacedStore(store)[apiName];
	};

}
