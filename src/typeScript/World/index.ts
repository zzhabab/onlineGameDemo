import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { Brick, Scene } from '@/typeScript/Scene'
import { Ball, Boxman, Player, Role } from '@/typeScript/Role'
import { Octree } from 'utils/Octree'
import { Capsule } from 'three/examples/jsm/Addons.js'

const counter = useCounterStore()
export class World {
  scene: Scene
  roleList: Array<Role>
  clock: THREE.Clock
  constructor() {
    this.scene = new Scene()
    this.roleList = [new Boxman()]
    this.clock = new THREE.Clock()
    this.setRoleContact()
    this.initWorld()
    this.debug()
  }
  initWorld = () => {
    const containerElement = document.querySelector('.container')
    const sceneElement = document.createElement('div')
    sceneElement.setAttribute('class', 'scene')
    sceneElement.style.width = '100vw'
    sceneElement.style.height = '100vh'
    containerElement!.appendChild(sceneElement)
    // threejs开始
    counter.renderer.setSize(window.innerWidth, window.innerHeight);
    counter.renderer.shadowMap.enabled = true;
    const renderElement = counter.renderer.domElement
    renderElement.style.position = 'absolute'
    renderElement.style.top = '0'
    renderElement.style.left = '0'
    document.querySelector('#app')!.appendChild(counter.renderer.domElement);
    counter.camera.position.set(0, 20, 10)
    // 辅助
    const axesHelper = new THREE.AxesHelper(100);
    axesHelper.position.set(-0.1, 15, -3)
    counter.scene.add(axesHelper)
    this.animate()
  }
  animate = () => {
    requestAnimationFrame(this.animate);
    const deltaTime = this.clock.getDelta()
    counter.renderer.render(counter.scene, counter.camera);
    counter.physicsWorld.step(1 / 60, deltaTime, 3)

    // const _ball = this.roleList[0] as Ball
    // _ball.updata(_ball.ballMesh, _ball.ballBody)
    // this.scene.brickWall.forEach(brick => {
    //   brick.modelMesh.position.copy(brick.brickBody.position)
    // })

    // if (this.roleList[0].roleBaseBody.velocity.length() !== 0) {
    //   console.log(this.roleList[0].roleBaseBody.velocity)
    // }

    this.roleList.forEach(item => {
      item.updata()
      if (item instanceof Boxman || item instanceof Player) {
        if (item.mixer) {
          item.mixer.update(deltaTime)
        }
      }
    })

    counter.controls.target = new THREE.Vector3(this.roleList[0].roleBaseBody.position.x, this.roleList[0].roleBaseBody.position.y, this.roleList[0].roleBaseBody.position.z)
    counter.controls.update();
    if (window.location.hash === '#debug') {
      counter.cannonDebugger.update()
    }
  }
  setRoleContact = () => {
    this.roleList.forEach(role => {
      // friction范围是 0 到 1，0 表示完全没有摩擦，1 表示非常高的摩擦力。
      // restitution范围是 0 到 1，0 表示完全没有弹性（非弹性碰撞），1 1 表示碰撞完后完全弹回（弹性碰撞）。
      // contactEquationStiffness控制接触方程的刚度（弹性）。较高的刚度会导致碰撞时的接触反应更强，物体会迅速分离。较低的刚度则会导致较软的接触反应。它决定了物体在碰撞后是否会“穿透”或“压缩”
      // contactEquationRelaxation用于控制接触方程的松弛。较高的松弛值会导致接触力的过渡过程更平滑，而较低的松弛值则会让接触力反应得更快速。
      // const roleAndGround = new CANNON.ContactMaterial(role.rolePhysicsMaterial, this.scene.groundPhysicsMaterial, {friction: 0.1, restitution: 0.0, contactEquationStiffness: 1000})
      // counter.physicsWorld.addContactMaterial(roleAndGround)
      // const roleAndBrickWall = new CANNON.ContactMaterial(role.rolePhysicsMaterial, this.scene.brickWall[0].brickPhysicsMaterial, {friction: 1.0, restitution: 1.0, contactEquationStiffness: 10})
      // counter.physicsWorld.addContactMaterial(roleAndBrickWall)
    })
  }
  private debug = () => {
    if (window.location.hash === '#debug') {
      const gui = new GUI(); 
      let actionsFolder = gui.addFolder("actions").open(false);
      const boxmanActions = this.roleList[0].actions
      for (let key in boxmanActions) {
        actionsFolder.add(boxmanActions[key], "weight", 0, 1, 1).name(key);
      }
      // guiFolder.add(this.brickWall[0].brickBody.position, "y", -10, 10, 0.0001).name("y");
      // guiFolder.add(this.brickWall[0].brickBody.position, "z", -10, 10, 0.0001).name("z");
    }
  }
}