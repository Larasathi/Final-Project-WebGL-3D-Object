var scene, camera, renderer, mesh, clock;
var meshFloor, ambientLight, light;

var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.01 };
var USE_WIREFRAME = false;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};
var loadingManager = null;
var RESOURCES_LOADED = false;

// Models index
var models = {
	barrel: {
		obj:"Model/barrel.obj",
		mtl:"Model/barrel.mtl",
		mesh: null,
		castShadow: true
	},
	weapon: {
		obj:"Model/AK-47.obj",
		mtl:"Model/AK-47.mtl",
		mesh: null,
		castShadow: true
	}
	

};

// Meshes index
var meshes = {};


function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	clock = new THREE.Clock();
	
	
	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);
	
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};
	
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(30,30, 10,10),
		new THREE.MeshPhongMaterial({color:0x00ff00, wireframe:USE_WIREFRAME})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);
	
	
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,10,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 100;
	scene.add(light);
	
	
	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							if('castShadow' in models[key])
								node.castShadow = models[key].castShadow;
							else
								node.castShadow = true;
							
							if('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow;
							else
								node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}
	
	
	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	document.body.appendChild(renderer.domElement);
	
	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	// Clone models into meshes.
	meshes["barrel1"] = models.barrel.mesh.clone();
	meshes["barrel2"] = models.barrel.mesh.clone();
	meshes["barrel3"] = models.barrel.mesh.clone();
	meshes["barrel4"] = models.barrel.mesh.clone();
	meshes["barrel5"] = models.barrel.mesh.clone();
	

	// Reposition individual meshes, then add meshes to scene
	meshes["barrel1"].position.set(0, 0, 0);
	meshes["barrel1"].rotation.set(0, Math.PI, 0);
	meshes["barrel1"].scale.set(1,1,1);
	scene.add(meshes["barrel1"]);
	
	meshes["barrel2"].position.set(4, 0, 8);
	meshes["barrel2"].rotation.set(0, Math.PI, 0);
	meshes["barrel2"].scale.set(1,1,1);
	scene.add(meshes["barrel2"]);
	
	meshes["barrel3"].position.set(7, 0, 6);
	meshes["barrel3"].rotation.set(0, Math.PI, 0);
	meshes["barrel3"].scale.set(	1,1,1);
	scene.add(meshes["barrel3"]);
	
	meshes["barrel4"].position.set(-6, 0, 10);
	meshes["barrel4"].rotation.set(0, Math.PI, 0);
	meshes["barrel4"].scale.set(1,1,1);
	scene.add(meshes["barrel4"]);
	
	meshes["barrel5"].position.set(-11, 0, 3);
	meshes["barrel5"].rotation.set(0, Math.PI, 0);
	meshes["barrel5"].scale.set(1,1,1);
	scene.add(meshes["barrel5"]);
	
	
	
	//PLAYER WEAPON 
	meshes["playerweapon"] = models.weapon.mesh.clone();
	meshes["playerweapon"].position.set(0,0,0);
	meshes["playerweapon"].scale.set(0.05,0.05,.05);
	meshes["playerweapon"].rotation.set(0,100,0);
	scene.add(meshes["playerweapon"]);
	
}

function animate(){
	
	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}
	
	requestAnimationFrame(animate);
	
	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();
	
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	
	meshes["playerweapon"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI/4) * 0.25,
		camera.position.y - 0.1 + Math.sin(time*4 + camera.position.x + camera.position.y)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI/4) * 0.25
	);
	
	meshes["playerweapon"].rotation.set(
		camera.rotation.x,
		camera.rotation.y + 200,
		camera.rotation.z
	);
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;

