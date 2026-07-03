// 测试
// const imageBounds = map.projection.getProjBounds([105, 33, 109, 37]);
// const imageMesh = createBoundsMesh(imageBounds, 0xffff00);
// map.add(imageMesh);
// const tileBounds = map.projection.getTileBounds(7, 2, 3);
// const tileMesh = createBoundsMesh(tileBounds, 0xff0000);
// map.add(tileMesh);

// const mapBounds = map.imgSource[0]._projectionBounds;
// const mapMesh = createBoundsMesh(mapBounds, 0x00ff00);
// map.add(mapMesh);

// function createBoundsMesh(bounds: [number, number, number, number], color: ColorRepresentation) {
// 	const points = [];
// 	const z = 8;
// 	points.push(new Vector3(bounds[0], bounds[1], z));
// 	points.push(new Vector3(bounds[2], bounds[1], z));
// 	points.push(new Vector3(bounds[2], bounds[3], z));
// 	points.push(new Vector3(bounds[0], bounds[3], z));
// 	points.push(new Vector3(bounds[0], bounds[1], z));
// 	const geometry = new BufferGeometry().setFromPoints(points);
// 	const line = new Line(geometry, new LineBasicMaterial({ color }));
// 	line.renderOrder = 100;
// 	return line;
// }

import {
	AnimationMixer,
	BoxHelper,
	CameraHelper,
	CanvasTexture,
	ConeGeometry,
	DoubleSide,
	ExtrudeGeometry,
	LatheGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshBasicMaterialParameters,
	MeshLambertMaterial,
	MeshStandardMaterial,
	Plane,
	Scene,
	Shape,
	SphereGeometry,
	SpotLight,
	SpotLightHelper,
	Sprite,
	SpriteMaterial,
	TextureLoader,
	Vector2,
	Vector3,
} from "three";
import * as tt from "three-tile";
import * as plugin from "three-tile-plugin";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

import * as ms from "./mapSource";
// shadowTest(viewer, map);

export function testTopMesh(viewer: plugin.GLViewer, map: tt.TileMap) {
	viewer.renderer.shadowMap.enabled = true;
	map.receiveShadow = true;

	// 增加顶层场景，用于显示模型
	const topScene = new Scene();
	viewer.topScenes.push(topScene);

	const groundGroup = new plugin.GroundGroup(map);

	const centerGeo = new Vector3(110, 35, 0);
	const centerPosition = map.geo2world(centerGeo);

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("./lib/draco/gltf/");
	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);

	// 加载模型
	loader.load("./model/LittlestTokyo.glb", function (gltf) {
		const model = gltf.scene;
		model.traverse(child => {
			child.castShadow = true;
			child.receiveShadow = true;
		});
		// 计算模型位置
		model.position.copy(centerPosition);
		groundGroup.add(model);
		// 模型动画
		const mixer = new AnimationMixer(model);
		mixer.clipAction(gltf.animations[0]).play();
		map.addEventListener("update", evt => mixer.update(evt.delta));

		const scene = viewer.scene;
		// const scene = topScene;

		scene.receiveShadow = true;

		// 添加模型
		// scene.add(model);
		scene.add(groundGroup);
		// 添加环境光
		scene.add(viewer.ambLight.clone());
		// 添加直射光
		scene.add(viewer.dirLight.clone());

		// 添加一个聚光灯
		const shadowLight = new SpotLight(0xffffff, 10, 4e3, Math.PI / 6, 0.2, 0);
		shadowLight.position.set(centerPosition.x, 2e3, centerPosition.z + 1000);
		shadowLight.target = model;
		shadowLight.castShadow = true;
		shadowLight.shadow.camera.near = 1e3;
		shadowLight.shadow.camera.far = 6e3;
		scene.add(shadowLight);

		// 添加一个聚光灯相机辅助模型
		const cameraHelper = new CameraHelper(shadowLight.shadow.camera);
		scene.add(cameraHelper);

		// // 添加一个聚光灯辅助模型
		const lightHelper = new SpotLightHelper(shadowLight);
		scene.add(lightHelper);

		// viewer.flyToObject(model, { animate: false });
		// viewer.flyTo(centerPosition, new Vector3(centerPosition.x, 2000, centerPosition.z), true);

		viewer.flyToObject(model, { pitchDeg: 50 });
	});
}

export function testTileHelperBox(map: tt.TileMap) {
	map.addEventListener("tile-loaded", evt => {
		const mesh = evt.tile.model;
		if (mesh) {
			mesh.add(new BoxHelper(mesh, 0x00ff00));
			// console.log(map.projection.getLonLatBoundsFromXYZ(evt.tile.x, evt.tile.y, evt.tile.z));
		}
	});
	map.addEventListener("tile-unload", evt => {
		const mesh = evt.tile.model;
		if (mesh) {
			mesh.traverse(child => {
				if (child instanceof BoxHelper) {
					child.dispose();
				}
			});
			mesh.clear();
		}
	});
}

export function goHome(viewer: plugin.GLViewer, map: tt.TileMap) {
	// 按下 F1 键事件
	window.addEventListener("keydown", event => {
		if (event.key === "F1") {
			event.preventDefault();
			if (!map.getObjectByName("boards")) {
				// open("https://github.com/sxguojf/three-tile");
				const boards = createBillboards("three-tile");
				boards.name = "boards";
				map.add(boards);

				map.addEventListener("loading-complete", () => {
					const info = map.getLocalInfoFromGeo(lonlat);
					if (info) {
						// boards.visible = (info.object as Tile).z > 10;
						boards.visible = true;
						const pos = map.geo2map(info.location);
						boards.position.copy(pos);
					}
				});
			}
			const lonlat = new Vector3(108.94236, 34.2855, 0);
			const centerPosition = map.geo2world(lonlat);
			const cameraPosition = centerPosition.clone().add(new Vector3(-1000, 2000, 0));
			viewer.flyTo(centerPosition, cameraPosition);
		}
	});
}

function drawBillboards(txt: string, size: number = 128) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Failed to get canvas context");
	}

	canvas.width = size;
	canvas.height = size;
	const centerX = size / 2;
	const centerY = size / 2;

	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = "#000022";
	ctx.strokeStyle = "DarkGoldenrod";

	ctx.lineWidth = 5;
	ctx.moveTo(centerX, 3);
	ctx.lineTo(centerX, size);
	ctx.stroke();
	ctx.closePath();

	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.roundRect(2, 2, size - 4, centerY - 8, 10);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	ctx.font = "24px Arial";
	ctx.fillStyle = "Goldenrod";
	ctx.strokeStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";

	ctx.strokeText(txt, centerX, 20);
	ctx.fillText(txt, centerX, 20);

	return canvas;
}

/**
 * 创建一个带有指定文本的广告牌精灵对象。
 *
 * @param txt - 要显示在广告牌上的文本内容。
 * @param size - 广告牌纹理的尺寸，默认为 128。
 * @returns 返回一个 Three.js 的 Sprite 对象，代表创建好的广告牌。
 */
export function createBillboards(txt: string, size = 128) {
	// 调用 drawBillboards 函数生成包含指定文本的画布，然后使用该画布创建纹理
	const boardTexture = new CanvasTexture(drawBillboards(txt, size));
	// 使用创建好的纹理创建精灵材质，设置尺寸不随相机距离衰减
	const boardsMaterial = new SpriteMaterial({
		map: boardTexture,
		sizeAttenuation: false,
	});
	// 使用精灵材质创建一个精灵对象，即广告牌
	const boards = new Sprite(boardsMaterial);
	// 默认将广告牌设置为不可见
	boards.visible = false;
	// 设置广告牌的中心点位置，x 轴居中，y 轴偏移 0.3
	boards.center.set(0.5, 0.3);
	// 缩放广告牌的尺寸
	boards.scale.setScalar(0.1);
	boards.renderOrder = 999;
	return boards;
}

export function addIcon(map: tt.TileMap, lonlat: Vector3) {
	const icon = new Sprite(
		new SpriteMaterial({ map: new TextureLoader().load("./image/gis.png"), sizeAttenuation: false, transparent: true })
	);
	icon.renderOrder = 999;
	icon.center.set(0.5, 0);
	icon.scale.setScalar(0.05);
	const position = map.geo2map(lonlat);
	icon.position.copy(position);
	map.add(icon);
}

export function createGroundGroup(map: tt.TileMap) {
	const groundGroup = new plugin.GroundGroup(map);
	groundGroup.name = "groundGroup";
	map.add(groundGroup);
	const ball = new Mesh(new ConeGeometry(1, 20, 32), new MeshLambertMaterial({ color: 0xff0000, wireframe: false }));
	ball.rotateX(-Math.PI / 2);
	for (let i = 0; i < 1000; i++) {
		const oneBall = ball.clone();
		const lon = Math.random() * 360 - 180;
		const lat = Math.random() * 180 - 90;
		oneBall.position.copy(map.geo2map(new Vector3(lon, lat, 0)));
		oneBall.scale.setScalar(10000);
		groundGroup.add(oneBall);
	}
}

class Filter extends MeshBasicMaterial {
	constructor(params?: MeshBasicMaterialParameters) {
		super(params);
		this.onBeforeCompile = shader => {
			// 修改片段着色器
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <dithering_fragment>",
				`
				// 1. 取纹理颜色
				vec4 texel = texture2D( map, vMapUv );
	
				// 2. 反色处理
				vec3 inverted = mix(texel.rgb, 1.0 - texel.rgb, 1.0);
				
				// 4. 转换为灰度
				float luminance = dot(inverted, vec3(0.299, 0.587, 0.114));
				vec3 grayscale = vec3(luminance);
				
				// 4. 应用目标颜色
				vec3 finalColor = mix(grayscale, inverted, 0.3) * diffuse * 2.0;
				
				// 5. 最终颜色
				gl_FragColor =  vec4( finalColor, opacity * texel.a );
			`
			);
		};
	}
}

export function testShader() {
	const loader = tt.getImgLoader<tt.TileMaterialLoader>("image");
	loader.material = new Filter({ color: 0xaabbee });
}

export function testPolyHole(map: tt.TileMap) {
	const cityMaskSource = new plugin.GeoJSONSource({
		url: "./cityBoundsMask.json",
		dataType: "geojson",
		style: {
			stroke: true,
			color: "red",
			fill: true,
			fillColor: "#ffffff",
			fillOpacity: 1,
		},
		opacity: 0,
		// bounds: [107.68, 35.35, 110.52, 37.52],
	});
	map.imgSource = [ms.arcGisImgSource, cityMaskSource];

	map.addEventListener("tile-loaded", evt => {
		const model = evt.tile.model;
		if (model && model.material.length > 1) {
			const mat0 = model.material[0];
			const mat1 = model.material[1];
			if (mat0 instanceof MeshStandardMaterial && mat1 instanceof MeshStandardMaterial) {
				mat0.transparent = true;
				mat0.alphaTest = 0.5;
				mat0.alphaMap = mat1.map;
			}
		}
	});

	fetch("./延安市.json").then(res => {
		res.json().then(data => {
			console.log(data);
			const coordinates = data.features[0].geometry.coordinates;
			const mesh = createExtrudedMesh(map, coordinates[0]);
			mesh.renderOrder = 100000000;
			mesh.translateZ(-10000);
			map.add(mesh);
		});
	});
}
export function testPolyHole1(map: tt.TileMap) {
	const cityMaskSource = new plugin.GeoJSONSource({
		url: "./延安市.json",
		dataType: "geojson",
		style: {
			stroke: true,
			color: "red",
			fill: true,
			fillColor: "#ffffff",
			fillOpacity: 1,
		},
		opacity: 0,
		// bounds: [107.68, 35.35, 110.52, 37.52],
	});
	const cityMaskSource1 = new plugin.GeoJSONSource({
		url: "./延安市.json",
		dataType: "geojson",
		style: {
			stroke: true,
			color: "red",
			weight: 3,
			fill: false,
			fillColor: "#ffffff",
			fillOpacity: 1,
		},
		opacity: 1,
		// bounds: [107.68, 35.35, 110.52, 37.52],
	});
	map.imgSource = [ms.arcGisImgSource, cityMaskSource, cityMaskSource1];

	map.addEventListener("tile-loaded", evt => {
		const model = evt.tile.model;
		if (model && model.material.length > 1) {
			const mat0 = model.material[0];
			const mat1 = model.material[1];
			if (mat0 instanceof MeshStandardMaterial && mat1 instanceof MeshStandardMaterial) {
				mat0.alphaMap = mat1.map;
			}
		}
	});

	fetch("./延安市.json").then(res => {
		res.json().then(data => {
			console.log(data);
			const coordinates = data.features[0].geometry.coordinates;
			const mesh = createExtrudedMesh(map, coordinates[0]);
			mesh.renderOrder = 100;
			mesh.translateZ(-10000);
			map.add(mesh);
		});
	});

	// const ball = new Mesh(
	// 	// new TorusKnotGeometry(80000, 30000),
	// 	new BoxGeometry(200000, 200000, 50000),
	// 	new MeshStandardMaterial({ color: "#049ef4", emissive: 0, roughness: 0.0 })
	// );
	const points = [];
	for (let i = 0; i < 10; i++) {
		points.push(new Vector2(Math.sin(i * 0.2) * 200000 + 5, (i - 5) * 12000));
	}
	const geometry = new LatheGeometry(points);
	const material = new MeshStandardMaterial({
		color: 0x049ef4,
		side: DoubleSide,
		flatShading: true,
		emissive: 0,
		roughness: 0.3,
		metalness: 0.8,
	});
	const lathe = new Mesh(geometry, material);
	lathe.rotation.x = Math.PI / 2;
	lathe.position.copy(map.geo2map(new Vector3(109.05, 36.4, -20000)));
	// map.add(lathe);

	const ball = new Mesh(
		new SphereGeometry(80000, 32, 32),
		new MeshStandardMaterial({ color: "#049ef4", emissive: 0, roughness: 0.0 })
	);
	ball.renderOrder = 100;
	ball.position.copy(lathe.position);
	// map.add(ball);
}

// 创建挤压几何体
function createExtrudedMesh(map: tt.TileMap, coordinates: any, depth = 10000) {
	// 墨卡托投影函数
	function lonLatToXY(lon: number, lat: number) {
		const pos = map.geo2map(new Vector3(lon, lat));
		return [pos.x, pos.y];
	}

	const shape = new Shape();
	const [firstPoint] = coordinates[0];
	const p0 = lonLatToXY(firstPoint[0], firstPoint[1]);
	shape.moveTo(p0[0], p0[1]);

	for (let i = 1; i < coordinates[0].length; i++) {
		const [lon, lat] = coordinates[0][i];
		const p1 = lonLatToXY(lon, lat);
		shape.lineTo(p1[0], p1[1]);
	}

	const geometry = new ExtrudeGeometry(shape, {
		depth: depth,
		// bevelEnabled: true,
		// bevelSize: 1000,
	});
	const plane = new Plane(new Vector3(0, -1, 0), 1500);
	const material = new MeshStandardMaterial({
		color: 0x049ef4,
		// color: 0x005522,
		emissive: 0,
		roughness: 0.5,
		metalness: 0.5,
		// transparent: true,
		// opacity: 0.,
		clipIntersection: false,
		side: DoubleSide,
		// map: new TextureLoader().load("./image/test.jpg"),
	});
	material.clippingPlanes = [plane];
	// map.add(new PlaneHelper(plane, 10000000));
	// const material = new MeshLambertMaterial({ color: "0x333333", transparent: true, opacity: 0.5 });
	return new Mesh(geometry, material);
}
