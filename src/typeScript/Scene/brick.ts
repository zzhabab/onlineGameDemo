import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const counter = useCounterStore()

export class Brick {
  model: THREE.Group = counter.resources.data.brickBase.gltf!.scene.clone() as THREE.Group
  modelMesh: THREE.Mesh = new THREE.Mesh()
  static brickSize: THREE.Vector3
  brickPhysicsMaterial = new CANNON.Material('brickPhysicsMaterial')
  brickBody: CANNON.Body
  constructor() {
    if (!Brick.brickSize) {
      const brickCollisionGroup = counter.resources.data.brickCollision.gltf!.scene
      brickCollisionGroup!.traverse((obj: any) => {
        if (obj.isMesh) {
          Brick.brickSize = obj.scale
        }
      })
    }
    this.brickBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(Brick.brickSize!.x * 0.5, Brick.brickSize!.y * 0.5,  Brick.brickSize!.z * 0.5)),
      material: this.brickPhysicsMaterial
    });
    this.init()
  }
  init = () => {
    this.model.traverse( ( object: any ) => {
      if ( object.isMesh ) {
        object.castShadow = true;
        this.modelMesh = object
      }
    } );
    const skeleton = new THREE.SkeletonHelper( this.model );
    skeleton.visible = false;
    counter.scene.add( skeleton );
    this.setPhysics(this.modelMesh, this.brickBody)
  }
  setPhysics = (mesh: THREE.Mesh, body: CANNON.Body) => {
    mesh.userData = body
    counter.physicsWorld.addBody(body);
  }
}