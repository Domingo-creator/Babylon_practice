import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, SceneLoader } from "@babylonjs/core";
import {buildVillage} from './village.js'
import {buildCar} from './car.js'
// import * as BABYLON from 'babylonjs';
import * as BABYLON from '@babylonjs/core/legacy/legacy'
// import * as GUI from '@babylonjs/gui';
// import "@babylonjs/gui-editor"
// import "@babylonjs/gui"
// import { AdvancedDynamicTexture } from "@babylonjs/gui";
// import { AdvancedDynamicTexture } from '@babylonjs/gui/2D';

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        // var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
        camera.upperBetaLimit = Math.PI / 2.2;
        camera.attachControl(canvas, true);
        // var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene)
        light.intensity = 0.3;
       

        /////Objects
        //make sphere
        // var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        buildVillage(scene);


        /********* CAR ***********/
        // const car = buildCar(scene);
        buildCar(scene)
       
        // SCENELOADER TEST
        const CreateCar = async () => {
            const {meshes} = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "car.glb"
            )
            console.log("meshes", meshes)
            
            const car2 = meshes[0]
            car2.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, Math.PI / 2);
            car2.position.y = 1.16;
            car2.position.x = 2;
            car2.position.z = 5;
        }
        
        CreateCar();

        /////////////////////
        const car = scene.getMeshByName("car");
        car.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, Math.PI / 2);
        car.position.y = 0.16;
        car.position.x = 3;
        car.position.z = 8;

        const animCar = new BABYLON.Animation("carAnimation", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const carKeys = []; 
  
        carKeys.push({
          frame: 0,
          value: 10
        });
  
  
        carKeys.push({
          frame: 200,
          value: -15
        });
  
        animCar.setKeys(carKeys);
  
        car.animations = [];
        car.animations.push(animCar);
  
        scene.beginAnimation(car, 0, 200, true);
        
        //wheel animation
        const wheelRB = scene.getMeshByName("wheelRB");
        const wheelRF = scene.getMeshByName("wheelRF");
        const wheelLB = scene.getMeshByName("wheelLB");
        const wheelLF = scene.getMeshByName("wheelLF");
        
        scene.beginAnimation(wheelRB, 0, 30, true);
        scene.beginAnimation(wheelRF, 0, 30, true);
        scene.beginAnimation(wheelLB, 0, 30, true);
        scene.beginAnimation(wheelLF, 0, 30, true);
        
        
        /************  car hitbox *********/
        const wireMat = new BABYLON.StandardMaterial("wireMat");
        wireMat.alpha = 1;

        const hitBox = BABYLON.MeshBuilder.CreateBox("carbox", {width: 0.5, height: 0.6, depth: 4.5})
        hitBox.material = wireMat;
        hitBox.position.x = 3.1;
        hitBox.position.y = 0.3;
        hitBox.position.z = -5;

        let carReady = false;

        /************** DUDE *****************/
        const walk = function (turn, dist) {
            this.turn = turn;
            this.dist = dist;
        }
        
        const track = [];
        track.push(new walk(86, 7));
        track.push(new walk(-85, 14.8));
        track.push(new walk(-93, 16.5));
        track.push(new walk(48, 25.5));
        track.push(new walk(-112, 30.5));
        track.push(new walk(-72, 33.2));
        track.push(new walk(42, 37.5));
        track.push(new walk(-98, 45.2));
        track.push(new walk(0, 47))

        // track.push(new walk(180, 2.5));
        // track.push(new walk(0, 5));

        BABYLON.SceneLoader.ImportMeshAsync("him", "https://models.babylonjs.com/Dude/", "dude.babylon", scene).then((result) => {
            var dude = result.meshes[0];
            dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);
                    
            
            dude.position = new BABYLON.Vector3(-6, 0, 0);
            // dude.position = new BABYLON.Vector3(1.5, 0, -6.9);
            dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-95), BABYLON.Space.LOCAL);
            const startRotation = dude.rotationQuaternion.clone(); //use clone so that variables are independent not linked copies
            
            scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

            let distance = 0;
            let step = 0.015;
            let p = 0;

            scene.onBeforeRenderObservable.add(() => {

                if (!dude.getChildren()[1].intersectsMesh(hitBox) && scene.getMeshByName("car").intersectsMesh(hitBox)) {
                    return;
                }
                dude.movePOV(0, 0, step);
                distance += step;

                if(distance > track[p].dist) {
                    
                    dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(track[p].turn), BABYLON.Space.LOCAL);
                    p += 1;
                    p %= track.length;
                    if (p === 0) {
                        distance = 0;
                        dude.position = new BABYLON.Vector3(-6, 0, 0);
                        // dude.position = new BABYLON.Vector3(1.5, 0, -6.9);
                        dude.rotationQuaternion = startRotation.clone();
                    }
                }
            })
        });


        ///// GUI DAY-NIGHT /////////
        /// THIS LINE BREAKS IT //////

        // const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

     

      

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });


    }
}
new App();