import { Role } from '@/typeScript/Role'
import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from "gsap";

const counter = useCounterStore()
export class Ball extends Role {
  ballPhysicsMaterial = new CANNON.Material('ballPhysicsMaterial')
  ballMesh = new THREE.Mesh()
  ballBody: CANNON.Body
  constructor() {
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff })
    const _ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    const ballGroup = new THREE.Group()
    ballGroup.add(_ballMesh)
    super(ballGroup)
    this.ballMesh = _ballMesh
    this.ballBody = new CANNON.Body({
      mass: 1, // 设置质量
      shape: new CANNON.Sphere(0.3),
      position: new CANNON.Vec3(0, 0, 0),
      material: this.ballPhysicsMaterial
    });
    this.setPhysics(_ballMesh, this.ballBody)
  }
  setPhysics = (mesh: THREE.Mesh, body: CANNON.Body) => {
    mesh.userData = body
    counter.physicsWorld.addBody(body);
  }
}