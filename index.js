var cmd = process.argv.slice(2).pop();

switch (cmd) {
	case 'component:generate':
	case 'c:g':
		require('./utils/generate-component');
		break;
	case 'configure':
		require('./utils/setupConfig');
		break;
	default:
		require('./react/bin');
}
