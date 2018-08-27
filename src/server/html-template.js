'use strict';


export function htmlTemplate( domString, reduxState ) {
	return `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8"/>
		<title>Improved ao3</title>
	</head>
	<body style="margin:0">
		<div id="root">${ domString }</div>
		<script type="application/javascript">
			window.REDUX_INITIAL_STATE = ${ JSON.stringify( reduxState ) }
		</script>
	</body>
	<script type="application/javascript" src="/build/vendor.js"></script>
	<script type="application/javascript" src="/build/app.js"></script>
</html>
	`;
}
