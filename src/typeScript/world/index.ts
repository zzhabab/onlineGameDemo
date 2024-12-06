import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { Brick, Scene } from '@/typeScript/Scene'
import { Ball, Player, Role } from '@/typeScript/Role'

const counter = useCounterStore()
export class World {
  scene: Scene
  playerList: Array<Player>
  clock: THREE.Clock
  constructor() {
    this.scene = new Scene()
    // this.roleList = [new Ball()]
    this.playerList = [new Player()]
    this.clock = new THREE.Clock()
    this.setPlayerContact()
    this.init()
  }
  init = () => {
    // let mixer: THREE.AnimationMixer
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
    counter.camera.position.set(0, 10, 10)
    // 辅助
    const axesHelper = new THREE.AxesHelper(100);
    counter.scene.add(axesHelper)
    this.animate()
  }
  animate = () => {
    requestAnimationFrame(this.animate);
    const deltaTime = this.clock.getDelta()
    counter.renderer.render(counter.scene, counter.camera);
    counter.controls.update();
    counter.cannonDebugger.update()
    counter.physicsWorld.step(1 / 60, deltaTime, 3)

    // const _ball = this.roleList[0] as Ball
    // _ball.updataState(_ball.ballMesh, _ball.ballBody)

    // this.scene.brickWall.forEach(brick => {
    //   brick.modelMesh.position.copy(brick.brickBody.position)
    // })

    this.playerList.forEach(player => {
      if (player.mixer) {
        player.mixer.update(deltaTime)
      }
    })
    this.playerList.forEach(player => {
      player.updataState(player.model, player.model.userData as CANNON.Body)
    })

    // this.roleList[0].updataState(this.roleList[0].roleGroup.children[0] as THREE.Mesh, this.roleList[0].roleGroup.children[0].userData as CANNON.Body)
    // const myPlayer: Player = this.roleList[1] as Player
    // if (myPlayer.mixer) {
    //   myPlayer.mixer.update(deltaTime)
    // }
  }
  setPlayerContact = () => {
    this.playerList.forEach(player => {
      // friction范围是 0 到 1，0 表示完全没有摩擦，1 表示非常高的摩擦力。
      // restitution范围是 0 到 1，0 表示完全没有弹性（非弹性碰撞），1 1 表示碰撞完后完全弹回（弹性碰撞）。
      // contactEquationStiffness控制接触方程的刚度（弹性）。较高的刚度会导致碰撞时的接触反应更强，物体会迅速分离。较低的刚度则会导致较软的接触反应。它决定了物体在碰撞后是否会“穿透”或“压缩”
      // contactEquationRelaxation用于控制接触方程的松弛。较高的松弛值会导致接触力的过渡过程更平滑，而较低的松弛值则会让接触力反应得更快速。
      const playerAndGround = new CANNON.ContactMaterial(player.playerPhysicsMaterial, this.scene.groundPhysicsMaterial, {friction: 1.0, restitution: 0.0, contactEquationStiffness: 1})
      counter.physicsWorld.addContactMaterial(playerAndGround)
      const playerAndBrickWall = new CANNON.ContactMaterial(player.playerPhysicsMaterial, this.scene.brickWall[0].brickPhysicsMaterial, {friction: 1.0, restitution: 1.0, contactEquationStiffness: 10})
      counter.physicsWorld.addContactMaterial(playerAndBrickWall)
    })
  }
}