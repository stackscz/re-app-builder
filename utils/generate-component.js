var fs = require('fs');
var prompt = require('prompt');

var templateComponentCode = fs.readFileSync(__dirname + '/template-component.js', "utf-8");

var schema = {
	properties: {
		component_name: {
			required: true
		}
	}
};

prompt.get(schema, function (err, result) {
	if (!result) {
		console.log();
		return;
	}
	var componentName = result.component_name;
	templateComponentCode = templateComponentCode.replace(/XXXXXX/g, componentName);

	prompt.get({
		properties:{
			filename: {
				default: componentName
			}
		}
	}, function(err, result) {
		if (!result) {
			console.log();
			return;
		}

		fs.writeFileSync(componentName + '.js', templateComponentCode + '\n');
		console.log('./' + componentName + '.js created.');
	});

});
