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

const counter = useCounterStore()
export class Player extends Role {
  mixer: THREE.AnimationMixer | null = null
  model: THREE.Group = counter.resources.data.soldierBase.gltf!.scene
  gltf = counter.resources.data.soldierBase.gltf as GLTF
  playerPhysicsMaterial = new CANNON.Material('playerPhysicsMaterial')
  actions: Actions = {}
  constructor() {
    super(new THREE.Group())
    this.setRoleGroup(this.model)
    this.addToScene()
    this.setSkeleton()
    this.getActions()
    // this.setPhysices()
    this.getBoundingBox()
  }
  setSkeleton = () => {
    const skeleton = new THREE.SkeletonHelper( this.model );
    skeleton.visible = false;
    counter.scene.add( skeleton );
  }
  getActions = () => {
    const animations = this.gltf.animations;
    this.mixer = new THREE.AnimationMixer( this.model );
    const idleAction = this.mixer.clipAction( animations[ 0 ] );
    const runAction = this.mixer.clipAction( animations[ 1 ] );
    const walkAction = this.mixer.clipAction( animations[ 3 ] );
    this.actions.idle = idleAction
    this.actions.run = runAction
    this.actions.walk = walkAction
    for(let key in this.actions) {
      if (key === 'idle') {
        this.actions[key].weight = 1
      } else {
        this.actions[key].weight = 0
      }
      this.actions[key].play()
    }
  }
  setPhysices = () => {
    const quaternion = new CANNON.Quaternion()
    quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    /* 注意这个quaternion不能添加到body上而是设置给addShape方法的_orientation
    不然在同步渲染模型和物理模型的quaternion时位置依然不重合 */
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 10, 0),
      material: this.playerPhysicsMaterial
    })
    this.model.traverse((object: any) => {
      if (object.isMesh) {
        object.castShadow = true;
        const geometry = object.geometry
        // const scale = object.scale
        const scale = {
          x: 0.01,
          y: 0.01,
          z: 0.01
        }
        const vertices = geometry.attributes.position.array
        const verticesArray: number[] = []
        const facesArray = geometry.index!.array
        for (let i = 0; i < vertices.length; i += 3) {
          verticesArray.push(vertices[i] * scale.x, vertices[i+1] * scale.y, vertices[i+2] * scale.z);
        }
        const offset = new CANNON.Vec3(object.position.x, object.position.y, object.position.z);
        const shape = new CANNON.Trimesh(verticesArray, facesArray);
        body.addShape(shape, offset, quaternion)
      }
    })
    this.model.userData = body
    counter.physicsWorld.addBody(body)
  }
  getBoundingBox = () => {
    const bodyMesh: THREE.SkinnedMesh = this.model.getObjectByName('vanguard_Mesh') as THREE.SkinnedMesh
    bodyMesh.geometry.computeBoundingBox()
    const boundingBox = bodyMesh.geometry.boundingBox as THREE.Box3
    boundingBox.applyMatrix4(new THREE.Matrix4().scale(new THREE.Vector3(0.01, 0.01, 0.01)))
    boundingBox.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
    const boxHelper = new THREE.Box3Helper(boundingBox, 0x222222)
    // cannon.body
    const width = Math.abs(boundingBox.max.x - boundingBox.min.x)
    const height = Math.abs(boundingBox.max.y - boundingBox.min.y)
    const deep = Math.abs(boundingBox.max.z - boundingBox.min.z)
    const body = new CANNON.Body({
      mass: 1,
      material: this.playerPhysicsMaterial
    })
    body.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, deep / 2)), new CANNON.Vec3(0, height / 2, 0))
    // this.model.userData = body
    counter.physicsWorld.addBody(body)
  }
}