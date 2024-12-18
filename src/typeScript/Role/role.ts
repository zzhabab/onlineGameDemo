import { useCounterStore } from '@/stores/counter'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from "gsap";
import { GLTF } from 'three/examples/jsm/Addons.js';
import { Actions } from '@/type'

const counter = useCounterStore()

// 派生类构造函数先于基类的执行
export abstract class Role {
  public roleBody?: CANNON.Body
  public roleBaseBody: CANNON.Body = new CANNON.Body()
  public currentActions?: THREE.AnimationAction
  constructor(
    public roleGroup: THREE.Group,
    public mixer?: THREE.AnimationMixer,
    public gltf?: GLTF,
    public rolePhysicsMaterial?: CANNON.Material,
    public roleOption: {
      [key: string]: any
    } = {},
    public actions: Actions = {}
  ) {
    this.addToScene()
  }
  setSkeleton = () => {
    const skeleton = new THREE.SkeletonHelper(this.roleGroup);
    skeleton.visible = false;
    counter.scene.add( skeleton );
  }
  getActions = () => {
    const animations = this.gltf!.animations;
    animations.forEach((item, index) => {
      this.actions[item.name] = this.mixer!.clipAction(item)
      if (item.name === 'idle') {
        this.actions[item.name].weight = 1
      } else {
        this.actions[item.name].weight = 0
      }
      this.actions[item.name].play()
    })
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
  updata = () => {
    if (this.roleBody) {
      this.roleBody.position.set(this.roleBaseBody.position.x, this.roleBaseBody.position.y + this.roleOption.y, this.roleBaseBody.position.z)
      this.roleBody.quaternion.set(this.roleBaseBody.quaternion.x, this.roleBaseBody.quaternion.y, this.roleBaseBody.quaternion.z, this.roleBaseBody.quaternion.w);
      this.roleGroup.position.set(this.roleBaseBody.position.x, this.roleBaseBody.position.y - this.roleOption.y, this.roleBaseBody.position.z)
      this.roleGroup.quaternion.set(this.roleBaseBody.quaternion.x, this.roleBaseBody.quaternion.y, this.roleBaseBody.quaternion.z, this.roleBaseBody.quaternion.w);
    }
    if (counter.isItTakingAction) {
      // console.log(this.roleBaseBody.velocity.length())
    } else {
      this.roleBaseBody.material!.friction = 0.03
      if (this.roleBaseBody.velocity.length() < 0.1 && this.currentActions) {
        this.actions.idle.weight = 1
        this.currentActions.weight = 0
      }
    }
  }
  abstract forward: () => void
  abstract backward: () => void
  abstract turnLeft: () => void
  abstract turnRight: () => void
}