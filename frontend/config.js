/**
 * define configuration options here
 */

var url = {
	protocol : 'http',
	hostname : 'localhost',
	port : '8000',
};
url.api_base_path = url.protocol + "://" + url.hostname + ":" + url.port + "/"

export { url };
