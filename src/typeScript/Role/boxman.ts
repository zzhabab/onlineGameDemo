import { Role } from '@/typeScript/Role'
import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { gsap } from "gsap";
import { mod } from 'three/examples/jsm/nodes/Nodes.js';
import { Octree } from 'three/examples/jsm/math/Octree.js'
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Actions } from '@/type'
import * as Utils from '@/utils'

const counter = useCounterStore()
export class Boxman extends Role {
  constructor() {
    super(
      counter.resources.data.boxman.gltf!.scene,
      new THREE.AnimationMixer(counter.resources.data.boxman.gltf!.scene),
      counter.resources.data.boxman.gltf,
      new CANNON.Material('boxmanPhysicsMaterial'),
      {
        x: 0.05,
        y: 0.025,
        z: 0.05
      },
    )
    this.setSkeleton()
    this.getActions()
    this.setCollider()
  }
  setCollider = () => {
    const boxmanBody = new CANNON.Body({
      mass: 0,
      material: this.rolePhysicsMaterial
    })
    const boxmanShape = new CANNON.Sphere(0.3)
    const yOffset = 0.57
    boxmanBody.addShape(boxmanShape, new CANNON.Vec3(0, 0 + yOffset, 0))
    boxmanBody.addShape(boxmanShape, new CANNON.Vec3(0, 0.25 + yOffset, 0))
    boxmanBody.addShape(boxmanShape, new CANNON.Vec3(0, -0.25 + yOffset, 0))
    this.roleBody = boxmanBody
    // 人物底座
    this.roleBaseBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(this.roleOption.x, this.roleOption.y, this.roleOption.z)),
      // material: new CANNON.Material({friction: 0.03})
      material: new CANNON.Material({friction: 0})
    })
    this.setPosition()
    counter.physicsWorld.addBody(this.roleBaseBody)
    counter.physicsWorld.addBody(boxmanBody)
  }
  setPosition = () => {
    const worldScene = counter.resources.data.world.gltf!.scene
    const targetObject: THREE.Object3D = worldScene.getObjectByName('Spawn024') as THREE.Object3D
    const worldPos = new THREE.Vector3()
    targetObject.getWorldPosition(worldPos)
    this.roleBaseBody.position.set(worldPos.x, worldPos.y + this.roleOption.y, worldPos.z)
  }
  forward = () => {
    const cameraForwardVector = Utils.getCameraForwardVectorIgnoreY()
    // 计算两向量间的夹角（相机朝向的x、z轴的分量和人物朝向）
    const angle = counter.playerForwardVector.angleTo(cameraForwardVector)
    // 计算旋转轴（两个向量的叉积）
    const rotationAxis = new THREE.Vector3().crossVectors(counter.playerForwardVector, cameraForwardVector).normalize();
    // 创建旋转四元数
    const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
    this.run(angle, quaternion, cameraForwardVector)
  }
  backward = () => {

  }
  turnLeft = () => {
    const cameraForwardVector = Utils.getCameraForwardVectorIgnoreY()
    const yAxis = new THREE.Vector3(0, 1, 0)
    const leftVector = new THREE.Vector3().crossVectors(yAxis, cameraForwardVector).normalize();
    const angle = counter.playerForwardVector.angleTo(leftVector)
    const rotationAxis = new THREE.Vector3().crossVectors(counter.playerForwardVector, leftVector).normalize();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
    this.run(angle, quaternion, leftVector)
  }
  turnRight = () => {
    const cameraForwardVector = Utils.getCameraForwardVectorIgnoreY()
    const yAxis = new THREE.Vector3(0, 1, 0)
    const rightVector = new THREE.Vector3().crossVectors(cameraForwardVector, yAxis).normalize();
    const angle = counter.playerForwardVector.angleTo(rightVector)
    const rotationAxis = new THREE.Vector3().crossVectors(counter.playerForwardVector, rightVector).normalize();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
    this.run(angle, quaternion, rightVector)
  }
  private run = (angle: number, quaternion: THREE.Quaternion, vector: THREE.Vector3) => {
    if (angle >= Math.PI / 2) {
    } else {

    }
    /* 注意这里若是直接quaternion.copy()或者quaternion.set()会导致第一次转向正确但是后续转向
    会从初始朝向转动而不是当前朝向转动 */
    this.roleBaseBody.quaternion.mult(new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w), this.roleBaseBody.quaternion);
    this.roleBaseBody.material!.friction = 0
    this.actions.run.weight = 1
    this.actions.idle.weight = 0
    const forwardScalar = 2
    this.roleBaseBody!.velocity.set(vector.x * forwardScalar, vector.y * forwardScalar, vector.z * forwardScalar)
    counter.playerForwardVector.set(vector.x, vector.y, vector.z)
    this.currentActions = this.actions.run
  }
}