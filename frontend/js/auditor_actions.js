import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';
import types from './auditor/action_types.js'

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */


