var cwd = process.cwd();

var prompt = require('prompt');
var path = require('path');
var fs = require('fs');


//
// Get two properties from the user: username and email
//
var schema = {
	properties: {}
};

var Finder = require('fs-finder');
var _ = require('lodash');
prompt.colors = false;
prompt.start();

Finder
	.from(process.cwd())
	.exclude(['node_modules'])
	.findFiles('*.dist.json', function (files) {

		configureFiles(files);

		// do something with given list of files
	});

function configureFiles(files) {
	var file = files.pop();
	if (!file) {
		return;
	}
	console.log('>>> Configuring file: ', file);

	var inputFilename = file;
	var outputFilename = file.replace(/(\.dist\.json)$/gi, '.local.json');

	try {

		var configDist = JSON.flatten(JSON.parse(fs.readFileSync(inputFilename)));

		var contents = null;
		try {
			contents = fs.readFileSync(outputFilename);
		} catch (e) {
			if (e.name == 'Error') {
				fs.closeSync(fs.openSync(outputFilename, 'w'));
			}
		}

		if(contents === null) {
			contents = '{}';
		}

		try {
			var configOut = JSON.flatten(JSON.parse(contents));
		} catch (e) {
			console.log('Not valid json file');
			configureFiles(files);
			return;
		}


		_.each(configDist, function (param, paramKey) {
			if (!configOut[paramKey]) {
				schema.properties[paramKey] = {
					required: true,
					default: param,
					type: 'string'
				};
				if (_.isArray(param)) {
					schema.properties[paramKey]['default'] = '[' + param.join(',') + ']';
					schema.properties[paramKey]['before'] = function (value) {
						var csv = value.replace(/[\[\]]/ig, '').trim();
						var res = csv ? csv.split(',').map(function (i) {
							return i.trim();
						}) : '';
						return res || false;
					}
				}
			}
		});

		prompt.get(schema, function (err, result) {
			fs.writeFileSync(outputFilename, JSON.stringify(JSON.unflatten(_.merge(configOut, result)), null, 2));
			configureFiles(files);
		});

	} catch (e) {
		e.name === 'SyntaxError' ? console.log('Invalid json file') : console.log(e);
	}
}

JSON.unflatten = function (data) {
	"use strict";
	if (Object(data) !== data || Array.isArray(data))
		return data;
	var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
		resultholder = {};
	for (var p in data) {
		var cur = resultholder,
			prop = "",
			m;
		while (m = regex.exec(p)) {
			cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
			prop = m[2] || m[1];
		}
		cur[prop] = data[p];
	}
	return resultholder[""] || resultholder;
};

JSON.flatten = function (data) {
	var result = {};

	function recurse(cur, prop) {
		if (Object(cur) !== cur) {
			result[prop] = cur;
		} else if (Array.isArray(cur)) {
			result[prop] = cur;
			//result[prop] = '[' + cur.join(',') + ']';
			//for (var i = 0, l = cur.length; i < l; i++)
			//	recurse(cur[i], prop + "[" + i + "]");
			//if (l == 0)
			//	result[prop] = [];
		} else {
			var isEmpty = true;
			for (var p in cur) {
				isEmpty = false;
				recurse(cur[p], prop ? prop + "." + p : p);
			}
			if (isEmpty && prop)
				result[prop] = {};
		}
	}

	recurse(data, "");
	return result;
};

