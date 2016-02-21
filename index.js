var cmd = process.argv.slice(2).pop();

switch (cmd) {
	case 'configure':
		require('./utils/setupConfig');
		break;
	default:
		require('./react/bin');
}
