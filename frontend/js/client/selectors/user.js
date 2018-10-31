
export default class UserSelectors {
	constructor(namespace){
		this.namespace = namespace;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findCurrentUser = (store) => {
		return this.getNamespacedStore(store).user;
	};

	isClientAdmin = (store) => {
		const user = this.findCurrentUser(store);
		if(user){
			return user.is_client_admin;
		} else {
			return false;
		}
	};
}
