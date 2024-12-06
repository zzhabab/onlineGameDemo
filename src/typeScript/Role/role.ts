import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from "gsap";

const counter = useCounterStore()
// let model: THREE.Group<THREE.Object3DEventMap>
// export class Role {
//   roleGeometry: THREE.BufferGeometry
//   roleMaterial: THREE.MeshStandardMaterial
//   roleMesh: THREE.Mesh
//   roleBody: CANNON.Body
//   rolePhysicsMaterial: CANNON.Material
//   constructor(
//     roleGeometry: THREE.BufferGeometry,
//     roleMaterial: THREE.MeshStandardMaterial,
//     roleMesh: THREE.Mesh,
//     roleBody: CANNON.Body,
//     rolePhysicsMaterial: CANNON.Material
//   ) {
//     this.roleGeometry = roleGeometry
//     this.roleMaterial = roleMaterial
//     this.roleMesh = roleMesh
//     this.roleBody = roleBody
//     this.rolePhysicsMaterial = rolePhysicsMaterial
//     this.setPhysics()
//     this.addToWorld()
//   }
//   addToWorld = () => {
//     counter.scene.add(this.roleMesh);
//   }
//   removeFromWorld = () => {
//     counter.scene.remove(this.roleMesh)
//   }
//   forward = () => {
//     const nextValue = model.position.x + 1
//     gsap.to(model.position, {
//       duration: 2,
//       x: nextValue,
//       ease: "power2.out",
//     })
//   }
// }

export class Role {
  roleGroup: THREE.Group
  constructor(
    roleGroup: THREE.Group
  ) {
    this.roleGroup = roleGroup
    this.addToScene()
  }
  getRoleGroup = (): THREE.Group => {
    return this.roleGroup
  }
  setRoleGroup = (roleGroup: THREE.Group) => {
    if (this.roleGroup.parent) {
      this.roleGroup.parent.remove(this.roleGroup)
    }
    this.roleGroup = roleGroup
  }
  addToScene = () => {
    counter.scene.add(this.roleGroup);
  }
  removeFromScene = () => {
    counter.scene.remove(this.roleGroup)
  }
  updataState = (group: THREE.Group, physicsBody: CANNON.Body) => {
    // group.position.copy(physicsBody.position)
    // group.quaternion.set(physicsBody.quaternion.x, physicsBody.quaternion.y, physicsBody.quaternion.z, physicsBody.quaternion.w);

    physicsBody.position.copy(new CANNON.Vec3(group.position.x, group.position.y, group.position.z))
    physicsBody.quaternion.set(group.quaternion.x, group.quaternion.y, group.quaternion.z, group.quaternion.w);
  }
}