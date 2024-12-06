import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Brick } from '@/typeScript/Scene'
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { mod, temp } from 'three/examples/jsm/nodes/Nodes.js';

const counter = useCounterStore()
export class Scene {
  planeMesh: THREE.Mesh
  groundPhysicsMaterial = new CANNON.Material('groundMaterial');
  brickWall: Array<Brick> = Array.from({length: 3}, (_, index) => new Brick())
  constructor() {
    this.planeMesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
    this.init()
    // this.createBrickWall()
    this.setPhysics()
  }
  init = () => {
    this.planeMesh.rotation.x = - Math.PI / 2;
    this.planeMesh.receiveShadow = true;
    counter.scene.add( this.planeMesh );
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 50, 0 );
    counter.scene.add( hemiLight );
    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( 20, 20, 0 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    counter.scene.add( dirLight );
    const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
    counter.scene.add(directionalLightHelper);
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    counter.scene.add(hemisphereLightHelper);
  }
  setPhysics = () => {
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: this.groundPhysicsMaterial
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.planeMesh.userData = groundBody
    counter.physicsWorld.addBody(groundBody)
  }
  private createBrickWall = () => {
    const gui = new GUI(); 
    let guiFolder = gui.addFolder("盒子定位");
    guiFolder.add(this.brickWall[0].brickBody.position, "x", -10, 10, 0.0001).name("x");
    guiFolder.add(this.brickWall[0].brickBody.position, "y", -10, 10, 0.0001).name("y");
    guiFolder.add(this.brickWall[0].brickBody.position, "z", -10, 10, 0.0001).name("z");

    const myBrickModelGroupList: THREE.Group[] = this.brickWall.map(({model}, index) => model)
    const yOffset = Brick.brickSize.y / 2
    this.brickWall[0].brickBody.position.set(Brick.brickSize.x * 3, 0 + yOffset, 0)
    this.brickWall[1].brickBody.position.set(Brick.brickSize.x * 3, Brick.brickSize.y + yOffset, 0)
    this.brickWall[2].brickBody.position.set(Brick.brickSize.x * 3, Brick.brickSize.y / 2 + yOffset, Brick.brickSize.z)
    const tempGroup = new THREE.Group()
    myBrickModelGroupList.forEach(item => {
      tempGroup.add(item)
    })
    // tempGroup.rotation.x = -Math.PI / 2
    counter.scene.add(tempGroup)
  }
}