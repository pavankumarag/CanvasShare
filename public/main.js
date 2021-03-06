//Canvas Drawing
$(function() {
	var canvas,
	context,
	dragging = false,
	dragStartLocation,
	snapshot,
	x1,y1,
	x2,y2,sides,angle;

	//Function to get Coordinates
	function getCanvasCoordinates(event) {

		var x = event.clientX - canvas.getBoundingClientRect().left,
		y = event.clientY - canvas.getBoundingClientRect().top;
		return {x: x, y: y};
	}
	function takeSnapshot() {
		snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
	}
	function restoreSnapshot() {
		context.putImageData(snapshot, 0, 0);
	} 

	//Draw the line
	function drawLine(x1,y1,x2,y2) {
		var color_picker = $('#c_picker').val();
		context.strokeStyle = '#'+color_picker;
		context.fillStyle = '#'+color_picker;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.stroke();

	}
	// Fill or not to fill
	function fill(a){
		if (a) {
			fillBox.checked=true;
		}
		else{
			fillBox.checked=false;
		}
	}
	//Function to set color on changes
	function colorSetter(color){
		$('#c_picker').val(color);
	}
	//Function for circle
	function drawCircle(x1,y1,x2,y2) {
		var color_picker = $('#c_picker').val();
		context.strokeStyle = '#'+color_picker;
		context.fillStyle = '#'+color_picker;
		var radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
		context.beginPath();
		context.arc(x1, y1, radius, 0, 2 * Math.PI, false);
		if(fillBox.checked){
			context.fill();
		}
		else{
			context.stroke();
		}
	}
	//Function for Polygon

	function drawPolygon(x1,y1,x2,y2, sides, angle) {
		var color_picker = $('#c_picker').val();
		context.strokeStyle = '#'+color_picker;
		context.fillStyle = '#'+color_picker;
		var coordinates = [],
		radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)),
		index = 0;
		for (index = 0; index < sides; index++) {
			coordinates.push({x: x1 + radius * Math.cos(angle), y: y1 - radius * Math.sin(angle)});
			angle += (2 * Math.PI) / sides;
		}
		context.beginPath();
		context.moveTo(coordinates[0].x, coordinates[0].y);
		for (index = 1; index < sides; index++) {
			context.lineTo(coordinates[index].x, coordinates[index].y);
		}
		context.closePath();
		if(fillBox.checked){
			context.fill();
		}
		else{
			context.stroke();
		}
	}
	//Function for Square
	function drawSquare(x1,y1,x2,y2,sides,angle) {
		var color_picker = $('#c_picker').val();
		context.strokeStyle = '#'+color_picker;
		context.fillStyle = '#'+color_picker;
		var coordinates = [],
		radius = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)),
		index = 0;
		for (index = 0; index < sides; index++) {
			coordinates.push({x: x1 + radius * Math.cos(angle+Math.PI/4), y: y1 - radius * Math.sin(angle+Math.PI/4)});
			angle += Math.PI/2;
		}
		context.beginPath();
		context.moveTo(coordinates[0].x, coordinates[0].y);
		for (index = 1; index < sides; index++) {
			context.lineTo(coordinates[index].x, coordinates[index].y);
		}
		context.closePath();
		if(fillBox.checked){
			context.fill();
		}
		else{
			context.stroke();
		}
	}

	// Sends the function parameters to the clients
	function sending(x1,x2,y1,y2,sides,angle){
		var prop={x1:x1,x2:x2,y1:y1,y2:y2,sides:sides,angle:angle};
		var a=JSON.stringify(prop);
		return a;

	}
	// Main draw function that calls the other draw functions
	function draw(x2,y2){
		fillBox=$("#fillBox")[0];
		radiobutton1=$("#radiobutton1")[0];
		radiobutton2=$("#radiobutton2")[0];
		radiobutton3=$("#radiobutton3")[0];
		radiobutton4=$("#radiobutton4")[0];

		var b =JSON.stringify(fillBox.checked)
		socket.emit('fill',b);
		var color_picker =JSON.stringify($('#c_picker').val())
		socket.emit('color',color_picker);

		if(radiobutton1.checked ==true ){
			a=sending(x1,x2,y1,y2,sides,angle);
			socket.emit('line',a);

		}
		if(radiobutton2.checked==true){
			a=sending(x1,x2,y1,y2,sides,angle);
			socket.emit('circle',a);
		}
		if(radiobutton3.checked==true){
			a=sending(x1,x2,y1,y2,sides,angle);
			socket.emit('polygon',a);
		}
		if(radiobutton4.checked==true){
			a=sending(x1,x2,y1,y2,sides,angle);
			socket.emit('square',a);
		}
	}
	//To show currently drawn item
	function currentDraw(x2,y2){
		fillBox=$("#fillBox")[0];
		radiobutton1=$("#radiobutton1")[0];
		radiobutton2=$("#radiobutton2")[0];
		radiobutton3=$("#radiobutton3")[0];
		radiobutton4=$("#radiobutton4")[0];

		if(radiobutton1.checked ==true ){
			drawLine(x1,y1,x2,y2);}

		if(radiobutton2.checked==true){
			drawCircle(x1,y1,x2,y2)
		}
		if(radiobutton3.checked==true){
			drawPolygon(x1,y1,x2,y2,8,Math.PI/4);
		}
		if(radiobutton4.checked==true){
			drawSquare(x1,y1,x2,y2,4,Math.PI/2);
		}
	}
	function dragStart(event) {
		dragging = true;
		dragStartLocation = getCanvasCoordinates(event);
		takeSnapshot();
		x1=dragStartLocation.x;
		y1=dragStartLocation.y;
	}
	function drag(event) {
		var position;
		if (dragging === true) {
			restoreSnapshot();
			position = getCanvasCoordinates(event);
			x2=position.x;
			y2=position.y;
			currentDraw(x2,y2);
		}
	}
	function dragStop(event) {
		dragging = false;
		restoreSnapshot();
		var position = getCanvasCoordinates(event);
		draw(x2,y2);
		x2=position.x;
		y2=position.y;
	}
	function init() {
		canvas = $("#canvas")[0];
		context = canvas.getContext('2d');
		var color_picker = $('#c_picker').val();
		context.strokeStyle = '#'+color_picker;
		context.fillStyle = '#'+color_picker;
		context.lineWidth = 4;
		context.lineCap = 'round';
		canvas.addEventListener('mousedown', dragStart, false);
		canvas.addEventListener('mousemove', drag, false);
		canvas.addEventListener('mouseup', dragStop, false);
	}
	window.addEventListener('load', init, false);
	$("#clearer").click(function(){
		var fake = JSON.stringify('checker');
		socket.emit('clear');
	});
	var socket=io();
	socket.on('line',function(data){
		var b=JSON.parse(data);
		drawLine(b.x1,b.y1,b.x2,b.y2)
	});

	socket.on('circle',function(data){
		var b=JSON.parse(data);
		drawCircle(b.x1,b.y1,b.x2,b.y2)
	});

	socket.on('polygon',function(data){
		var b=JSON.parse(data);
		drawPolygon(b.x1,b.y1,b.x2,b.y2,8,Math.PI/4);
	});
	socket.on('square',function(data){
		var b=JSON.parse(data);
		drawSquare(b.x1,b.y1,b.x2,b.y2,4,Math.PI/2);
	});
	socket.on('color',function(data){
		var c=JSON.parse(data)
		colorSetter(c);
	});
	socket.on('fill',function(data){
		var c=JSON.parse(data)
		fill(c);
	});
	socket.on('clear',function(){
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );
	});
});